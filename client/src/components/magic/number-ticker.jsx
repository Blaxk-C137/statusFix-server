import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Magic UI — Number Ticker
 * Counts up to `value` when scrolled into view.
 */
export function NumberTicker({ value, direction = "up", delay = 0, className, decimalPlaces = 0 }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
      return () => clearTimeout(t);
    }
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [springValue, decimalPlaces]
  );

  return (
    <span ref={ref} className={cn("inline-block tabular-nums tracking-wider", className)}>
      0
    </span>
  );
}

export default NumberTicker;
