import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ShieldCheck } from "lucide-react";

import Optimizer from "./Optimizer";
import { Particles } from "./magic/particles";
import { AnimatedGradientText } from "./magic/animated-gradient-text";
import { BorderBeam } from "./magic/border-beam";

// Three.js is heavy — load the scene chunk after first paint.
const HeroScene = lazy(() => import("./three/HeroScene"));

/**
 * The landing IS the service: one screen, optimizer card at the centre,
 * effects confined to ambient background so the tool is usable instantly.
 */
export default function Landing() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".land-rise", {
        y: 22,
        opacity: 0,
        stagger: 0.09,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.05,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Ambient backdrop: 3D blob + particles, all behind the tool */}
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        <Particles className="absolute inset-0" quantity={70} color="#25D366" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,hsl(168,14%,3%)_20%,transparent_70%)]" />
      </div>

      <div className="container flex flex-1 flex-col items-center justify-center gap-6 pb-12 pt-24 sm:pt-28">
        <div className="land-rise relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
          <BorderBeam size={60} duration={6} borderWidth={1} colorFrom="#25D366" colorTo="#7CFFB2" />
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Server-side FFmpeg · files deleted after every job
        </div>

        <h1 className="land-rise text-center font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Your status, <AnimatedGradientText className="pb-1">uncrushed.</AnimatedGradientText>
        </h1>

        <p className="land-rise -mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
          Drop a photo or clip below — get back a WhatsApp-ready file under the
          5MB / 16MB status limits, so WhatsApp never degrades it.
        </p>

        {/* The service, immediately */}
        <div className="land-rise w-full max-w-2xl">
          <Optimizer bare />
        </div>
      </div>
    </section>
  );
}
