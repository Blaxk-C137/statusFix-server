/**
 * Ambient backdrop: aurora glows in the WhatsApp-green palette plus a
 * perspective grid that fades toward the viewport centre. Purely decorative.
 */
export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(160,20%,8%),hsl(168,14%,3%))]" />

      {/* Aurora glows */}
      <div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[hsl(142,70%,45%)] opacity-[0.10] blur-[120px]" />
      <div className="absolute top-24 -left-32 h-[360px] w-[360px] rounded-full bg-[hsl(165,80%,40%)] opacity-[0.07] blur-[100px]" />
      <div className="absolute top-64 -right-32 h-[320px] w-[320px] rounded-full bg-[hsl(142,80%,50%)] opacity-[0.06] blur-[100px]" />

      {/* Perspective grid, top-anchored */}
      <div className="bg-grid absolute inset-0" />

      {/* Bottom fade into background */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
