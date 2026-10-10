import { Sparkles, ArrowUpRight } from "lucide-react";
import { BackgroundBeams } from "./aceternity/background-beams";
import { BlurFade } from "./magic/blur-fade";
import { ShimmerButton } from "./magic/shimmer-button";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5">
      <BackgroundBeams className="opacity-60" />
      <div className="container relative flex flex-col items-center py-28 text-center">
        <BlurFade inView>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Stop letting WhatsApp
            <br />
            <span className="text-primary">decide your quality.</span>
          </h2>
        </BlurFade>
        <BlurFade inView delay={0.15}>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Free forever. No signup, no watermark, no files kept on our side.
          </p>
        </BlurFade>
        <BlurFade inView delay={0.25}>
          <a href="#optimizer" className="mt-8 inline-block">
            <ShimmerButton background="hsl(142, 70%, 49%)" shimmerColor="#d9ffe9">
              <span className="flex items-center gap-2 px-4 font-display font-semibold text-primary-foreground">
                Optimize a file
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </ShimmerButton>
          </a>
        </BlurFade>

        <div className="mt-20 flex w-full flex-col items-center gap-3 border-t border-white/5 pt-8 sm:flex-row sm:justify-between">
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/40">
              <Sparkles className="h-3 w-3 text-primary" />
            </span>
            <span className="font-display text-sm font-bold">
              Status<span className="text-primary">Fix</span>
            </span>
          </span>
          <p className="text-xs text-muted-foreground/60">
            Media is processed in temp storage and deleted immediately after your download.
          </p>
        </div>
      </div>
    </footer>
  );
}
