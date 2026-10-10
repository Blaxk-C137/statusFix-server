import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Clapperboard,
  UploadCloud,
  Cpu,
  Download,
  FileImage,
  Gauge,
  Film,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

const cardMotion = (i) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, delay: i * 0.08 },
});

const SPECS = [
  {
    icon: ImageIcon,
    tint: "text-[hsl(200,80%,65%)]",
    tintBg: "bg-[hsl(200,70%,50%,0.1)] ring-[hsl(200,70%,50%,0.3)]",
    title: "Image output",
    items: [
      { icon: FileImage, label: "Optimized JPEG" },
      { icon: Gauge, label: "Max 5MB guaranteed" },
      { icon: ImageIcon, label: "Up to 1600px wide" },
    ],
  },
  {
    icon: Clapperboard,
    tint: "text-primary",
    tintBg: "bg-primary/10 ring-primary/30",
    title: "Video output",
    items: [
      { icon: Film, label: "MP4 · H.264 + AAC" },
      { icon: Gauge, label: "Max 16MB, best-fit bitrate" },
      { icon: Timer, label: "720p · up to 3 minutes" },
    ],
  },
];

export function SpecsSection() {
  return (
    <section className="w-full">
      <motion.h2
        {...cardMotion(0)}
        className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70"
      >
        WhatsApp Status limits
      </motion.h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {SPECS.map((spec, i) => (
          <motion.div key={spec.title} {...cardMotion(i + 1)}>
            <Card className="group h-full transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(160,9%,22%)] hover:shadow-[0_12px_40px_-12px_hsl(142,70%,45%,0.15)]">
              <CardHeader className="pb-3">
                <span
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${spec.tintBg}`}
                >
                  <spec.icon className={`h-5 w-5 ${spec.tint}`} />
                </span>
                <CardTitle className="text-base">{spec.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {spec.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: UploadCloud,
    step: "01",
    title: "Drop your file",
    text: "Any photo or clip up to 50MB. Nothing uploads until you hit optimize.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Server re-encodes",
    text: "FFmpeg scales, retunes and two-pass encodes to the exact status budget.",
  },
  {
    icon: Download,
    step: "03",
    title: "Download & post",
    text: "Under every WhatsApp limit — post it and WhatsApp leaves it alone.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full">
      <motion.h2
        {...cardMotion(0)}
        className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70"
      >
        How it works
      </motion.h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div key={s.step} {...cardMotion(i + 1)}>
            <Card className="group relative h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(160,9%,22%)]">
              <span className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-bold text-muted/60 transition-colors group-hover:text-primary/10">
                {s.step}
              </span>
              <CardHeader className="relative pb-3">
                <s.icon className="mb-2 h-5 w-5 text-primary" />
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="w-full">
      <Separator className="mb-6 opacity-60" />
      <p className="text-center text-xs text-muted-foreground/60">
        StatusFix — media is processed in memory-temp storage and deleted
        immediately after your download. Nothing is kept, nothing is logged.
      </p>
    </footer>
  );
}
