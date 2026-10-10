import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronRight, FileImage, FileVideo, ShieldCheck, Zap } from "lucide-react";

// Three.js is heavy — load the scene chunk after first paint.
const HeroScene = lazy(() => import("./three/HeroScene"));
import { Particles } from "./magic/particles";
import { Marquee } from "./magic/marquee";
import { AnimatedGradientText } from "./magic/animated-gradient-text";
import { ShimmerButton } from "./magic/shimmer-button";
import { NumberTicker } from "./magic/number-ticker";
import { BorderBeam } from "./magic/border-beam";

const FORMATS = ["JPG", "PNG", "MP4", "MOV", "AVI", "MKV", "WEBM", "→ JPEG ≤5MB", "→ MP4 ≤16MB"];

function FormatChip({ label }) {
  const isOutput = label.startsWith("→");
  return (
    <span
      className={`mx-2 flex items-center gap-2 rounded-full border px-4 py-2 font-display text-sm tracking-wide ${
        isOutput
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground"
      }`}
    >
      {isOutput ? <Zap className="h-3.5 w-3.5" /> : label.includes("M") || label === "JPG" || label === "PNG"
        ? <FileImage className="h-3.5 w-3.5 opacity-60" />
        : <FileVideo className="h-3.5 w-3.5 opacity-60" />}
      {label}
    </span>
  );
}

export default function Hero() {
  const root = useRef(null);

  // GSAP cinematic entrance: chars cascade, then supporting elements rise.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-char", {
        yPercent: 120,
        opacity: 0,
        rotateX: -50,
        stagger: 0.028,
        duration: 0.9,
        ease: "back.out(1.6)",
        delay: 0.15,
      });
      gsap.from(".hero-fade", {
        y: 26,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.7,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const headline = "Your status,";
  const subline = "uncrushed.";

  return (
    <section id="top" ref={root} className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* 3D scene + particles backdrop */}
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        <Particles className="absolute inset-0" quantity={90} color="#25D366" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,hsl(168,14%,3%)_20%,transparent_70%)]" />
      </div>

      <div className="container flex flex-1 flex-col items-center justify-center pb-10 pt-28 text-center">
        {/* Badge with travelling border beam */}
        <div className="hero-fade relative mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
          <BorderBeam size={60} duration={6} borderWidth={1} colorFrom="#25D366" colorTo="#7CFFB2" />
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Server-side FFmpeg · files deleted after every job
        </div>

        {/* Headline — per-char GSAP reveal */}
        <h1 className="font-display text-[clamp(2.8rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-tight [perspective:600px]">
          {headline.split("").map((c, i) => (
            <span key={i} className="hero-char inline-block will-change-transform">
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
          <br />
          <AnimatedGradientText className="pb-2">
            {subline.split("").map((c, i) => (
              <span key={i} className="hero-char inline-block will-change-transform">
                {c}
              </span>
            ))}
          </AnimatedGradientText>
        </h1>

        <p className="hero-fade mt-6 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
          WhatsApp mangles every status upload that doesn't fit its limits.
          Feed it a file that's already perfect — sharp images, buttery video,
          always under 5MB / 16MB — and it leaves your media alone.
        </p>

        {/* Stats */}
        <div className="hero-fade mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          <div className="text-left">
            <div className="whitespace-nowrap font-display text-2xl font-bold text-primary sm:text-4xl">
              ≤<NumberTicker value={5} />MB
            </div>
            <p className="mt-1 text-xs text-muted-foreground/70">image output</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-left">
            <div className="whitespace-nowrap font-display text-2xl font-bold text-primary sm:text-4xl">
              ≤<NumberTicker value={16} />MB
            </div>
            <p className="mt-1 text-xs text-muted-foreground/70">video output</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-left">
            <div className="whitespace-nowrap font-display text-2xl font-bold text-primary sm:text-4xl">
              <NumberTicker value={720} />p
            </div>
            <p className="mt-1 text-xs text-muted-foreground/70">two-pass H.264</p>
          </div>
        </div>

        {/* CTA */}
        <div className="hero-fade mt-10">
          <a href="#optimizer">
            <ShimmerButton
              className="font-display text-base font-semibold"
              background="hsl(142, 70%, 49%)"
              shimmerColor="#d9ffe9"
            >
              <span className="flex items-center gap-2 px-4 text-primary-foreground">
                Optimize my media
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </ShimmerButton>
          </a>
        </div>
      </div>

      {/* Format marquee */}
      <div className="hero-fade relative border-y border-white/5 bg-black/20 py-2 backdrop-blur-sm">
        <Marquee pauseOnHover className="[--duration:30s]">
          {FORMATS.map((f) => <FormatChip key={f} label={f} />)}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
