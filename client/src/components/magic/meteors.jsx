import { cn } from "../../lib/utils";

/**
 * Magic UI — Meteors
 * Falling meteor streaks with randomized positions and delays.
 */
export function Meteors({ number = 20, className }) {
  const meteors = new Array(number).fill(true);
  return (
    <>
      {meteors.map((_, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] rounded-[9999px] bg-emerald-400 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-1/2 before:transform before:bg-gradient-to-r before:from-emerald-400 before:to-transparent before:content-['']",
            className
          )}
          style={{
            top: 0,
            left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
          }}
        />
      ))}
    </>
  );
}

export default Meteors;
