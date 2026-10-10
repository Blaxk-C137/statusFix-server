import { cn } from "../../lib/utils";

/**
 * Magic UI — Animated Gradient Text
 * Text wrapped in a smoothly sliding gradient.
 */
export function AnimatedGradientText({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex animate-gradient-x bg-gradient-to-r from-[#25D366] via-[#7CFFB2] to-[#25D366] bg-[length:200%_auto] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}

export default AnimatedGradientText;
