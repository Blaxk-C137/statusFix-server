import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, FileImage, FileVideo, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn, formatBytes } from "../lib/utils";

const ACCEPT = ".jpg,.jpeg,.png,.mp4,.mov,.avi,.mkv,.webm";

/**
 * Drag-and-drop surface with an animated corner-glow while a file hovers,
 * switching to a file-chip preview once a file is staged.
 */
export default function Dropzone({
  file,
  fileType,
  dragging,
  inputRef,
  onPick,
  onInputChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemove,
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
        "group relative cursor-pointer overflow-hidden rounded-xl border border-dashed transition-all duration-200 outline-none",
        "border-[hsl(160,9%,20%)] bg-[hsl(165,12%,5%,0.5)] hover:border-[hsl(160,9%,28%)] hover:bg-[hsl(165,12%,6%,0.6)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        dragging && "border-primary bg-[hsl(142,70%,49%,0.06)]",
        file && "cursor-default border-solid border-border"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={onInputChange}
        className="hidden"
      />

      {/* Spinning conic border glow while dragging */}
      {dragging && (
        <div
          aria-hidden
          className="animate-border-spin absolute -inset-[40%] bg-[conic-gradient(transparent_0deg,transparent_300deg,hsl(142,70%,55%)_330deg,transparent_360deg)] opacity-30"
        />
      )}

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
                animate={dragging ? { scale: 1.12, y: -4 } : { scale: 1, y: 0 }}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full border transition-colors",
                  dragging
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-secondary text-muted-foreground group-hover:text-foreground"
                )}
              >
                <CloudUpload className="h-6 w-6" />
              </motion.span>
              <p className="text-sm text-muted-foreground">
                Drop your file here or{" "}
                <span className="font-medium text-primary underline underline-offset-4 decoration-primary/40 group-hover:decoration-primary">
                  browse
                </span>
              </p>
              <p className="text-xs text-muted-foreground/60">
                Images (JPG, PNG) · Videos (MP4, MOV, AVI, MKV, WEBM) · Max 50MB
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
                    ? "border-[hsl(200,70%,50%,0.3)] bg-[hsl(200,70%,50%,0.1)] text-[hsl(200,80%,65%)]"
                    : "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {fileType === "image" ? (
                  <FileImage className="h-5 w-5" />
                ) : (
                  <FileVideo className="h-5 w-5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {file.name}
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/70">
                    {formatBytes(file.size)}
                  </span>
                  <Badge variant={fileType === "image" ? "secondary" : "default"}>
                    {fileType === "image" ? "Image" : "Video"}
                  </Badge>
                </span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
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
