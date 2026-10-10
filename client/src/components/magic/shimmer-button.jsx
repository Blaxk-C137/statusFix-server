import React from "react";
import { cn } from "../../lib/utils";

/**
 * Magic UI — Shimmer Button
 * Button wrapped in a rotating shimmer ring with a soft glow backdrop.
 */
export const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = "#7CFFB2",
      shimmerSize = "0.08em",
      borderRadius = "100px",
      shimmerDuration = "3s",
      background = "rgba(9, 13, 11, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={{
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background,
        }}
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div className={cn("-z-30 blur-[2px]", "absolute inset-0 overflow-visible [container-type:size]")}>
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        {children}

        {/* highlight */}
        <div className={cn("absolute inset-0 size-full rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]", "transform-gpu transition-all duration-300 ease-in-out", "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]", "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]")} />

        {/* backdrop cover showing only the ring */}
        <div className={cn("absolute [background:var(--bg)] [border-radius:var(--radius)]", "-z-20 [inset:var(--cut)]")} />
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
