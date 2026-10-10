import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  AlertTriangle, CheckCircle2, Download, Loader2, RotateCcw, Wand2,
} from "lucide-react";

import Dropzone from "./Dropzone";
import { BorderBeam } from "./magic/border-beam";
import { Ripple } from "./magic/ripple";
import { NumberTicker } from "./magic/number-ticker";
import { TextGenerateEffect } from "./aceternity/text-generate-effect";
import { MovingBorderButton } from "./aceternity/moving-border";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert } from "./ui/alert";
import { Progress } from "./ui/progress";
import { formatBytes } from "../lib/utils";
import { uploadAndProcess, getFileType, MAX_INPUT_BYTES } from "../lib/api";

const SPECS = {
  image: { format: "JPEG", maxSize: "5MB", note: "PNG/JPG → optimized JPEG (max 1600px)" },
  video: {
    format: "MP4 H.264", maxSize: "16MB", duration: "Max 3 min",
    note: "Any video → WhatsApp-ready MP4 (best quality that fits)",
  },
};

export default function Optimizer() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | processing | done | error
  const [uploadPct, setUploadPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null); // { url, name, size }
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const ctaRef = useRef();
  const busy = status === "uploading" || status === "processing";

  // GSAP magnetic CTA: the button leans toward the cursor, springs back on leave.
  useLayoutEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const onLeave = () => { xTo(0); yTo(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [file, status]);

  const reset = () => {
    setFile(null); setFileType(null); setStatus("idle");
    setUploadPct(0); setErrorMsg("");
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
    setFile(f); setFileType(type); setStatus("idle"); setErrorMsg(""); setResult(null);
  };

  const onInputChange = (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); };
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleProcess = async () => {
    if (!file || busy) return;
    setStatus("uploading"); setUploadPct(0); setErrorMsg(""); setResult(null);
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
    a.href = result.url; a.download = result.name; a.click();
  };

  const spec = fileType ? SPECS[fileType] : null;
  const savedPct =
    file && result?.size && result.size < file.size
      ? Math.round((1 - result.size / file.size) * 100)
      : null;

  return (
    <section id="optimizer" className="relative py-24 sm:py-32">
      {/* ambient section glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <div className="container max-w-2xl">
        <div className="mb-10 text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            The optimizer
          </p>
          <TextGenerateEffect
            className="mx-auto max-w-md"
            words="Drop it. We make it WhatsApp-proof."
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* ripples behind the card */}
          <Ripple className="-z-10 opacity-60" mainCircleSize={320} numCircles={6} />

          <div className="glass relative overflow-hidden rounded-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]">
            <BorderBeam size={180} duration={9} colorFrom="#25D366" colorTo="#0d9488" />
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <Dropzone
                file={file} fileType={fileType} dragging={dragging} inputRef={inputRef}
                onInputChange={onInputChange} onDrop={onDrop}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onRemove={reset}
              />

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
                            <Loader2 className="h-3 w-3 animate-spin" /> Uploading… {uploadPct}%
                          </p>
                        </>
                      ) : (
                        <>
                          <Progress indeterminate />
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {fileType === "video"
                              ? "Two-pass FFmpeg encode running — videos take a moment."
                              : "Optimizing your image…"}
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {status === "error" && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <Alert variant="destructive">
                      <AlertTriangle />
                      <span>{errorMsg}</span>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {status === "done" && result && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <Alert variant="success">
                      <CheckCircle2 />
                      <span>
                        Optimized to{" "}
                        <strong className="font-semibold">
                          <NumberTicker value={Math.round(result.size / 1024)} /> KB
                        </strong>
                        {savedPct !== null && ` (−${savedPct}% vs original)`} — WhatsApp will stream it untouched.
                      </span>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {status !== "done" ? (
                <div ref={ctaRef} className="will-change-transform">
                  <MovingBorderButton
                    containerClassName="w-full"
                    className="h-12 w-full font-display text-base font-semibold"
                    duration={2200}
                    onClick={handleProcess}
                    disabled={!file || busy}
                  >
                    {busy ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {status === "uploading" ? "Uploading…" : "Processing…"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-primary">
                        <Wand2 className="h-4 w-4" />
                        Optimize for WhatsApp
                      </span>
                    )}
                  </MovingBorderButton>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2.5 sm:flex-row"
                >
                  <Button size="lg" variant="success" className="flex-1" onClick={triggerDownload}>
                    <Download /> Download optimized file
                  </Button>
                  <Button size="lg" variant="outline" onClick={reset}>
                    <RotateCcw /> Process another
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
