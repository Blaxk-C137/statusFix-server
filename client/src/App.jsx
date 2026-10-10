import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";

import Background from "./components/Background";
import Header from "./components/Header";
import Dropzone from "./components/Dropzone";
import { SpecsSection, HowItWorks, Footer } from "./components/InfoSections";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Alert } from "./components/ui/alert";
import { Progress } from "./components/ui/progress";
import { formatBytes } from "./lib/utils";

// Empty string = same origin (server hosts the client, or Vite's dev proxy).
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const SPECS = {
  image: { format: "JPEG", maxSize: "5MB", note: "PNG/JPG → optimized JPEG (max 1600px)" },
  video: {
    format: "MP4 H.264",
    maxSize: "16MB",
    duration: "Max 3 min",
    note: "Any video → WhatsApp-ready MP4 (best quality that fits)",
  },
};

const MAX_INPUT_BYTES = 50 * 1024 * 1024;

function getFileType(file) {
  if (!file) return null;
  const ext = file.name.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  return null;
}

/**
 * Upload with real progress: XHR tracks the upload phase; the remaining time
 * is server-side encoding (indeterminate shimmer).
 */
function uploadAndProcess(file, onUploadProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/process`);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          blob: xhr.response,
          outputSize: Number(xhr.getResponseHeader("X-Output-Size")) || xhr.response.size,
        });
      } else {
        // Error responses are JSON — decode the blob back to text.
        xhr.response
          .text()
          .then((text) => {
            let message = "Something went wrong on the server.";
            try {
              message = JSON.parse(text).error || message;
            } catch {
              /* keep default */
            }
            reject(new Error(message));
          })
          .catch(() => reject(new Error("Processing failed. Try again.")));
      }
    };

    xhr.onerror = () =>
      reject(new Error("Couldn't reach the server. Check your connection and try again."));
    xhr.ontimeout = () => reject(new Error("The request timed out. Try a smaller file."));

    const formData = new FormData();
    formData.append("media", file);
    xhr.send(formData);
  });
}

export default function App() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | processing | done | error
  const [uploadPct, setUploadPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null); // { url, name, size }
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const busy = status === "uploading" || status === "processing";

  const reset = () => {
    setFile(null);
    setFileType(null);
    setStatus("idle");
    setUploadPct(0);
    setErrorMsg("");
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = (f) => {
    const type = getFileType(f);
    if (!type) {
      setErrorMsg("Only images (JPG, PNG) and videos (MP4, MOV, AVI, MKV, WEBM) are supported.");
      setStatus("error");
      return;
    }
    if (f.size > MAX_INPUT_BYTES) {
      setErrorMsg(`File too large (${formatBytes(f.size)}). Max raw input is 50MB.`);
      setStatus("error");
      return;
    }
    if (result) URL.revokeObjectURL(result.url);
    setFile(f);
    setFileType(type);
    setStatus("idle");
    setErrorMsg("");
    setResult(null);
  };

  const onInputChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  const handleProcess = async () => {
    if (!file || busy) return;
    setStatus("uploading");
    setUploadPct(0);
    setErrorMsg("");
    setResult(null);

    try {
      const out = await uploadAndProcess(file, (pct) => {
        setUploadPct(pct);
        if (pct >= 100) setStatus("processing");
      });

      const ext = fileType === "image" ? ".jpg" : ".mp4";
      const url = URL.createObjectURL(out.blob);
      setResult({ url, name: `optimized_status${ext}`, size: out.outputSize });
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "Processing failed. Try again.");
      setStatus("error");
    }
  };

  const triggerDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.name;
    a.click();
  };

  const spec = fileType ? SPECS[fileType] : null;
  const savedPct =
    file && result?.size && result.size < file.size
      ? Math.round((1 - result.size / file.size) * 100)
      : null;

  return (
    <div className="relative min-h-screen">
      <Background />

      <div className="container flex min-h-screen max-w-3xl flex-col items-center gap-12 py-16 sm:py-20">
        <Header />

        {/* ── Optimizer card ─────────────────────────────── */}
        <motion.main
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full"
        >
          <Card className="glass overflow-hidden shadow-2xl shadow-black/40">
            {/* Top accent line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
              <Dropzone
                file={file}
                fileType={fileType}
                dragging={dragging}
                inputRef={inputRef}
                onInputChange={onInputChange}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onRemove={reset}
              />

              {/* Output spec chips */}
              <AnimatePresence>
                {spec && status !== "done" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>Output: {spec.format}</Badge>
                      <Badge>Max: {spec.maxSize}</Badge>
                      {spec.duration && <Badge>{spec.duration}</Badge>}
                      <span className="text-xs text-muted-foreground/60">{spec.note}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress state */}
              <AnimatePresence>
                {busy && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2">
                      {status === "uploading" ? (
                        <>
                          <Progress value={uploadPct} />
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading… {uploadPct}%
                          </p>
                        </>
                      ) : (
                        <>
                          <Progress indeterminate />
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {fileType === "video"
                              ? "Encoding with a two-pass FFmpeg pipeline — videos take a moment."
                              : "Optimizing your image…"}
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <Alert variant="destructive">
                      <AlertTriangle />
                      <span>{errorMsg}</span>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {status === "done" && result && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <Alert variant="success">
                      <CheckCircle2 />
                      <span>
                        Optimized to{" "}
                        <strong className="font-semibold">{formatBytes(result.size)}</strong>
                        {savedPct !== null && ` (−${savedPct}%)`} — under the WhatsApp
                        limit, so it won't be crushed again on upload.
                      </span>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              {status !== "done" ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleProcess}
                  disabled={!file || busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="animate-spin" />
                      {status === "uploading" ? "Uploading…" : "Processing…"}
                    </>
                  ) : (
                    <>
                      <Wand2 />
                      Optimize for WhatsApp
                    </>
                  )}
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2.5 sm:flex-row"
                >
                  <Button size="lg" variant="success" className="flex-1" onClick={triggerDownload}>
                    <Download />
                    Download optimized file
                  </Button>
                  <Button size="lg" variant="outline" onClick={reset}>
                    <RotateCcw />
                    Process another
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Micro-trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground/50"
          >
            <Sparkles className="h-3 w-3" />
            Free forever · no signup · no watermarks
          </motion.p>
        </motion.main>

        <SpecsSection />
        <HowItWorks />
        <Footer />
      </div>
    </div>
  );
}
