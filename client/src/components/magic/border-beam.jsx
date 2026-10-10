import { cn } from "../../lib/utils";

/**
 * Magic UI — Border Beam
 * A light beam that travels around the border of its parent.
 */
export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#25D366",
  colorTo = "#0d9488",
  delay = 0,
}) {
  return (
    <div
      style={{
        "--size": size,
        "--duration": duration,
        "--anchor": anchor,
        "--border-width": borderWidth,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": `-${delay}s`,
      }}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        "border-[length:calc(var(--border-width)*1px)] border-transparent",
        // mask so only the border ring is visible
        "[mask-clip:padding-box,border-box] [mask-composite:intersect]",
        "[mask-image:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        // pseudo-element carries the beam
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)]",
        "after:animate-border-beam after:[animation-delay:var(--delay)]",
        "after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)]",
        "after:[offset-anchor:calc(var(--anchor)*1%)_50%]",
        "after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className
      )}
    />
  );
}

export default BorderBeam;
