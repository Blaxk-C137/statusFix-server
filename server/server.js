const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ffmpeg-static ships only the ffmpeg binary; ffprobe comes from ffprobe-static.
// Both paths must be set explicitly — the deploy host (Render `env: node`) has
// neither binary on PATH, so relying on the system ffprobe fails there.
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins: explicit list from env (comma-separated), plus localhost for
// dev. Defaults to * when nothing is configured — same-origin deploys and
// health checks are unaffected because requests without an Origin header are
// always allowed either way.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";
const allowedOrigins = CLIENT_ORIGIN.split(",")
  .map((o) => o.trim())
  .filter(Boolean);
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin/no-origin requests (curl, health checks)
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// Serve the built client (client/dist) when it exists — lets a single
// Render deployment host both the frontend and the API.
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

app.use(express.json());

// Dirs — use the OS temp dir so ephemeral hosting disks stay clean
const UPLOAD_DIR = path.join(require("os").tmpdir(), "statusfix-uploads");
const OUTPUT_DIR = path.join(require("os").tmpdir(), "statusfix-outputs");
[UPLOAD_DIR, OUTPUT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer — 50MB raw input limit
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const IMAGE_EXTS = /\.(jpe?g|png)$/i;
const VIDEO_EXTS = /\.(mp4|mov|avi|mkv|webm)$/i;

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    // Extension is authoritative — mimetypes vary across platforms
    // (e.g. application/octet-stream, video/x-matroska) and ffmpeg
    // will reject actual garbage anyway.
    if (IMAGE_EXTS.test(path.extname(file.originalname)) ||
        VIDEO_EXTS.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

// Cleanup helper
function cleanup(...files) {
  files.forEach((f) => {
    if (f && fs.existsSync(f)) {
      fs.unlink(f, (err) => {
        if (err) console.error("Cleanup error:", err.message);
      });
    }
  });
}

// ─── IMAGE PROCESSING ────────────────────────────────────────────────────────
function processImage(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vf scale='min(1600,iw)':-2", // max 1600px wide, preserve ratio
        "-q:v 2",                      // MJPEG quality scale is 2-31, lower = better
      ])
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

// ─── VIDEO PROCESSING ────────────────────────────────────────────────────────
// Goal: the cleanest WhatsApp-status video that is guaranteed to fit 16MB.
//   1. Probe duration; reject clips longer than the 3-minute status cap.
//   2. Compute the video bitrate that exactly fills 16MB for that duration.
//   3. Two-pass H.264 ABR at that bitrate — spends the whole budget, so short
//      clips look near-transparent and long clips still fit, with predictable
//      output size (no CRF guesswork, no re-encode fallbacks).

const MAX_VIDEO_BYTES = 16 * 1024 * 1024;
const AUDIO_KBPS = 128;             // clean stereo AAC; ~3% of the budget
const MAX_DURATION = 180;           // WhatsApp status cap: 3 minutes
const SIZE_HEADROOM = 0.97;         // leave ~3% for MP4 container overhead

// WhatsApp-friendly, broadly compatible H.264 output:
// - 720p long-edge cap (handles vertical status clips too): the sweet spot for
//   phone playback — a well-fed 720p beats a bitrate-starved 1080p on status.
// - High profile / level 4.0: best compression on any phone from the last ~8y.
// - yuv420p + faststart: universal decoding + playback while the file loads.
// - force_divisible_by=2 keeps dimensions even (required by yuv420p) after scaling.
const VIDEO_FILTER =
  "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2";
const commonVideoOpts = [
  "-c:v", "libx264",
  "-preset", "medium",            // quality/speed balance; keeps encodes within request timeouts
  "-profile:v", "high",
  "-level", "4.0",
  "-pix_fmt", "yuv420p",
  "-vf", VIDEO_FILTER,
  "-movflags", "+faststart",
  "-t", String(MAX_DURATION),     // defensive hard cap (over-long clips are rejected earlier)
];

// Thrown for problems that are the user's file, not a server fault — the route
// turns these into a specific 4xx instead of a generic 500.
class ProcessingError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.status = status;
  }
}

function ffprobeJson(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

function runFfmpeg(inputPath, opts, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(opts)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });
}

// Highest video bitrate (kbps) that keeps the muxed file ≤ MAX_VIDEO_BYTES.
function targetVideoKbps(durationSec) {
  const totalKbps = (MAX_VIDEO_BYTES * 8) / durationSec / 1000;
  return Math.floor((totalKbps - AUDIO_KBPS) * SIZE_HEADROOM);
}

async function processVideo(inputPath, outputPath) {
  const probe = await ffprobeJson(inputPath);
  const rawDuration = parseFloat(probe.format && probe.format.duration);

  if (Number.isFinite(rawDuration) && rawDuration > MAX_DURATION) {
    throw new ProcessingError(
      `This video is ${Math.round(rawDuration)}s long. WhatsApp status videos are capped at 3 minutes — trim it to ${MAX_DURATION}s or less and try again.`
    );
  }

  // Known duration → size the bitrate to it. Unknown (rare/corrupt metadata) →
  // assume the full cap so the file still fits; -t trims anything longer.
  const duration =
    Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : MAX_DURATION;
  const videoKbps = targetVideoKbps(duration);

  // Unique per-job scratch names, all inside OUTPUT_DIR, so concurrent uploads
  // never collide and the two-pass logs get cleaned up (they live where we look).
  const base = path.basename(outputPath, path.extname(outputPath));
  const passLog = path.join(OUTPUT_DIR, `passlog-${base}`);
  const pass1Out = path.join(OUTPUT_DIR, `pass1-${base}.mp4`);

  try {
    // Pass 1: analyse only — no audio, discard output (ffmpeg needs a real file).
    await runFfmpeg(inputPath, [
      ...commonVideoOpts,
      "-b:v", `${videoKbps}k`,
      "-pass", "1", "-passlogfile", passLog,
      "-an", "-f", "mp4",
    ], pass1Out);

    // Pass 2: real encode at the analysed bitrate + clean AAC audio.
    await runFfmpeg(inputPath, [
      ...commonVideoOpts,
      "-b:v", `${videoKbps}k`,
      "-pass", "2", "-passlogfile", passLog,
      "-c:a", "aac", "-b:a", `${AUDIO_KBPS}k`,
    ], outputPath);
  } finally {
    // passLog lives in OUTPUT_DIR, so its -0.log / .mbtree siblings do too.
    // Runs even if a pass fails, so scratch never accumulates.
    const passBase = path.basename(passLog);
    const scratch = fs
      .readdirSync(OUTPUT_DIR)
      .filter((f) => f.startsWith(passBase))
      .map((f) => path.join(OUTPUT_DIR, f));
    cleanup(pass1Out, ...scratch);
  }
}

// ─── MAIN ROUTE ──────────────────────────────────────────────────────────────
app.post("/process", upload.single("media"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const inputPath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const isImage = IMAGE_EXTS.test(ext);
  const isVideo = VIDEO_EXTS.test(ext);

  if (!isImage && !isVideo) {
    cleanup(inputPath);
    return res.status(400).json({ error: "Unsupported file type." });
  }

  const outputExt = isImage ? ".jpg" : ".mp4";
  // UUID per job so concurrent uploads never share output/scratch filenames.
  const outputFilename = `optimized-${crypto.randomUUID()}${outputExt}`;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  try {
    if (isImage) {
      await processImage(inputPath, outputPath);
    } else {
      await processVideo(inputPath, outputPath);
    }

    // Safety net: the video path targets 16MB precisely and rejects over-long
    // clips up front, so reaching this branch means the encoder overshot on
    // unusually high-motion content.
    const stats = fs.statSync(outputPath);
    const maxSize = isImage ? 5 * 1024 * 1024 : MAX_VIDEO_BYTES;

    if (stats.size > maxSize) {
      cleanup(inputPath, outputPath);
      return res.status(422).json({
        error: isImage
          ? "This image is still over WhatsApp's 5MB limit after optimizing. Try a smaller image."
          : "Couldn't get this clip under WhatsApp's 16MB limit while keeping it watchable — it's very high-motion. Try a shorter clip.",
      });
    }

    // Send file, carrying output stats so the UI can show the size savings.
    const sizeBytes = stats.size;
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="optimized_status${outputExt}"`
    );
    res.setHeader(
      "Content-Type",
      isImage ? "image/jpeg" : "video/mp4"
    );
    res.setHeader("X-Output-Size", String(sizeBytes));
    res.setHeader("Access-Control-Expose-Headers", "X-Output-Size");

    res.sendFile(outputPath, (err) => {
      cleanup(inputPath, outputPath);
      if (err && !res.headersSent) {
        console.error("Send error:", err.message);
      }
    });
  } catch (err) {
    cleanup(inputPath, outputPath);
    // User-file problems (too long, etc.) carry a status → surface the message.
    if (err instanceof ProcessingError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("FFmpeg error:", err.message);
    res.status(500).json({ error: "Processing failed. Check your file and try again." });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// SPA fallback — only when serving the built client
if (fs.existsSync(clientDist)) {
  app.get("*", (req, res) => {
    if (path.extname(req.path)) {
      return res.status(404).send("Not found: " + req.path);
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Error handler — return clean JSON instead of HTML stack traces
// (covers multer rejections, CORS origin errors, etc.)
app.use((err, req, res, next) => {
  let status =
    err.message === "Unsupported file type" ||
    err.message === "Not allowed by CORS"
      ? 400
      : 500;
  // Multer raises LIMIT_FILE_SIZE for over-50MB uploads — answer 413, not 500.
  if (err.code === "LIMIT_FILE_SIZE") {
    status = 413;
    err.message = "File too large. Max raw input is 50MB.";
  }
  if (status === 500) console.error("Unhandled error:", err);
  res.status(status).json({ error: err.message || "Internal server error" });
});

const server = app.listen(PORT, () => console.log(`statusfix server running on port ${PORT}`));
// A two-pass encode can leave the response socket idle for a while on slow
// hosts; disable Node's socket-inactivity timeout so valid long encodes aren't
// cut off mid-stream. (An upstream proxy may still impose its own limit.)
server.setTimeout(0);
