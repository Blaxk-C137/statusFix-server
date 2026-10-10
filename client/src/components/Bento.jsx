import { motion } from "framer-motion";
import { Cpu, Download, ScanLine, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { Meteors } from "./magic/meteors";
import { DotPattern } from "./magic/dot-pattern";
import { BorderBeam } from "./magic/border-beam";
import { BlurFade } from "./magic/blur-fade";
import { cn } from "../lib/utils";

const cells = [
  {
    icon: UploadCloud,
    title: "1 · Drop your file",
    text: "Any photo or clip up to 50MB. Nothing leaves your device until you press optimize.",
    className: "md:col-span-3",
    deco: "dots",
  },
  {
    icon: Cpu,
    title: "2 · Server re-encodes",
    text: "FFmpeg scales, retunes and two-pass encodes to the exact WhatsApp budget — no quality guesswork.",
    className: "md:col-span-3",
    deco: "meteors",
  },
  {
    icon: ScanLine,
    title: "Bitrate sized to the byte",
    text: "Duration is probed, then the bitrate is computed to fill exactly 16MB. Short clips look immaculate, long clips always fit.",
    className: "md:col-span-2",
    deco: "beam",
  },
  {
    icon: ShieldCheck,
    title: "Under every limit",
    text: "5MB for images, 16MB for video, 3 minutes max — output is verified before it ever reaches you.",
    className: "md:col-span-2",
    deco: null,
  },
  {
    icon: Trash2,
    title: "Nothing is stored",
    text: "Uploads and outputs live in temp storage and are wiped the moment your download is sent.",
    className: "md:col-span-2",
    deco: null,
  },
];

export default function Bento() {
  return (
    <section id="how" className="relative py-24">
      <div className="container max-w-4xl">
        <BlurFade className="mb-10">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Three drops, zero compression grief
          </h2>
        </BlurFade>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {cells.map((cell, i) => (
            <BlurFade key={cell.title} delay={0.08 * i} inView className={cell.className}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "group relative h-full overflow-hidden rounded-xl border border-white/10",
                  "bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-6 backdrop-blur-sm",
                  "hover:border-primary/30 transition-colors"
                )}
              >
                {cell.deco === "meteors" && (
                  <div className="absolute inset-0 overflow-hidden opacity-70">
                    <Meteors number={8} />
                  </div>
                )}
                {cell.deco === "dots" && (
                  <DotPattern className="fill-emerald-400/15 [mask-image:radial-gradient(240px_circle_at_top_right,white,transparent)]" />
                )}
                {cell.deco === "beam" && (
                  <BorderBeam size={100} duration={7} delay={2} colorFrom="#25D366" colorTo="#0d9488" />
                )}

                <cell.icon className="mb-4 h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                <h3 className="font-display text-lg font-semibold">{cell.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cell.text}</p>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
