import { Sparkles, Github } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/40">
            <span className="absolute inset-0 rounded-lg bg-primary/25 blur-sm animate-pulse-glow" />
            <Sparkles className="relative h-4 w-4 text-primary" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Status<span className="text-primary">Fix</span>
          </span>
        </a>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#optimizer" className="hidden transition-colors hover:text-foreground sm:block">Optimizer</a>
          <a href="#how" className="hidden transition-colors hover:text-foreground sm:block">How it works</a>
          <a href="#limits" className="hidden transition-colors hover:text-foreground sm:block">Limits</a>
          <a
            href="#optimizer"
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_0_18px_-4px_hsl(142_70%_49%/0.6)] transition-all hover:shadow-[0_0_26px_-2px_hsl(142_70%_49%/0.75)]"
          >
            Optimize now
          </a>
        </div>
      </div>
    </nav>
  );
}
