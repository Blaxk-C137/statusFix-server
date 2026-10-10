import { Image as ImageIcon, Clapperboard, FileImage, Film, Gauge, Timer, Maximize, Check } from "lucide-react";
import { CardContainer, CardBody, CardItem } from "./aceternity/card-3d";
import { BlurFade } from "./magic/blur-fade";

const CARDS = [
  {
    icon: ImageIcon,
    accent: "from-sky-400/20 via-sky-400/5",
    iconClass: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    title: "Image output",
    items: [
      { icon: FileImage, label: "Optimized JPEG re-encode" },
      { icon: Maximize, label: "Up to 1600px wide, ratio kept" },
      { icon: Gauge, label: "Guaranteed ≤ 5MB" },
    ],
  },
  {
    icon: Clapperboard,
    accent: "from-primary/20 via-primary/5",
    iconClass: "border-primary/30 bg-primary/10 text-primary",
    title: "Video output",
    items: [
      { icon: Film, label: "MP4 · H.264 High + AAC" },
      { icon: Timer, label: "720p · up to 3 minutes" },
      { icon: Gauge, label: "Guaranteed ≤ 16MB" },
    ],
  },
];

export default function Specs3D() {
  return (
    <section id="limits" className="relative py-24">
      <div className="pointer-events-none absolute right-0 top-24 -z-10 h-[360px] w-[360px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="container max-w-4xl">
        <BlurFade className="mb-4">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            WhatsApp Status limits
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Engineered to the exact envelope
          </h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Hover the cards. Every file we hand back is measured against these
            limits before you download it.
          </p>
        </BlurFade>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {CARDS.map((card, i) => (
            <BlurFade key={card.title} delay={0.12 * i} inView>
              <CardContainer containerClassName="w-full" className="w-full">
                <CardBody
                  className={`relative h-auto w-full rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} to-transparent p-7 backdrop-blur-sm`}
                >
                  <CardItem translateZ={60}>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl border ${card.iconClass}`}>
                      <card.icon className="h-6 w-6" />
                    </span>
                  </CardItem>
                  <CardItem translateZ={50} className="mt-5">
                    <h3 className="font-display text-xl font-semibold">{card.title}</h3>
                  </CardItem>
                  <CardItem translateZ={40} className="mt-4 w-full" as="ul">
                    <ul className="w-full space-y-2.5">
                      {card.items.map((item) => (
                        <li key={item.label} className="flex w-full items-center gap-3 text-sm text-muted-foreground">
                          <item.icon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </CardItem>
                  <CardItem translateZ={30} className="mt-6 w-full">
                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                      <Check className="h-3.5 w-3.5" />
                      Verified server-side before download
                    </div>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
