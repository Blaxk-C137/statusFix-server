import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, FileImage, FileVideo, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { DotPattern } from "./magic/dot-pattern";
import { cn, formatBytes } from "../lib/utils";

const ACCEPT = ".jpg,.jpeg,.png,.mp4,.mov,.avi,.mkv,.webm";

export default function Dropzone({
  file, fileType, dragging, inputRef,
  onInputChange, onDrop, onDragOver, onDragLeave, onRemove,
}) {
  return (
    <div
      onClick={() => !file && inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      role="button"
      aria-label={file ? `Selected file ${file.name}` : "Upload a file"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!file && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-dashed transition-all duration-300 outline-none",
        "border-white/15 bg-black/30 hover:border-primary/40 hover:bg-black/40",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        dragging && "scale-[1.01] border-primary bg-primary/5",
        file && "cursor-default border-solid border-white/10"
      )}
    >
      <input ref={inputRef} type="file" accept={ACCEPT} onChange={onInputChange} className="hidden" />

      <DotPattern
        className={cn(
          "fill-emerald-400/20 transition-opacity duration-300 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          dragging ? "opacity-100" : "opacity-40 group-hover:opacity-70"
        )}
      />

      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center gap-3 px-6 py-14 text-center"
            >
              <motion.span
                animate={dragging ? { scale: 1.15, y: -6 } : { scale: 1, y: 0 }}
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl border transition-colors duration-300",
                  dragging
                    ? "border-primary/60 bg-primary/15 text-primary shadow-[0_0_40px_-8px_hsl(142_70%_49%/0.6)]"
                    : "border-white/10 bg-white/5 text-muted-foreground group-hover:text-foreground"
                )}
              >
                <CloudUpload className="h-7 w-7" />
              </motion.span>
              <p className="text-sm text-muted-foreground">
                Drop your file here or{" "}
                <span className="font-medium text-primary underline decoration-primary/40 underline-offset-4 group-hover:decoration-primary">
                  browse
                </span>
              </p>
              <p className="text-xs text-muted-foreground/60">
                JPG · PNG · MP4 · MOV · AVI · MKV · WEBM — up to 50MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-4 px-5 py-5 text-left"
            >
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border",
                  fileType === "image"
                    ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
                    : "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {fileType === "image" ? <FileImage className="h-5 w-5" /> : <FileVideo className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{file.name}</span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/70">{formatBytes(file.size)}</span>
                  <Badge variant={fileType === "image" ? "secondary" : "default"}>
                    {fileType === "image" ? "Image" : "Video"}
                  </Badge>
                </span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                aria-label="Remove file"
                className="shrink-0 rounded-md p-2 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
