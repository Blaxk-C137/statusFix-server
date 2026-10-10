import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "./ui/badge";

export default function Header() {
  return (
    <header className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6 flex items-center gap-2.5"
      >
        <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
          <span className="absolute inset-0 rounded-xl bg-primary/20 blur-md animate-pulse-glow" />
          <Sparkles className="relative h-5 w-5 text-primary" />
        </span>
        <span className="font-display text-2xl font-bold tracking-tight">
          Status<span className="text-primary">Fix</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <Badge variant="secondary" className="gap-1.5">
          <Zap className="h-3 w-3 text-primary" /> Server-side FFmpeg
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <ShieldCheck className="h-3 w-3 text-primary" /> Files deleted after use
        </Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.16 }}
        className="text-gradient mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
      >
        WhatsApp Status, without the crunch
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.24 }}
        className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base"
      >
        Drop a photo or clip and get back a WhatsApp-ready file — sized under
        the status limits so WhatsApp's compressor never gets a chance to ruin it.
      </motion.p>
    </header>
  );
}
