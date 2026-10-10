import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Progress bar. Pass `value` (0–100) for determinate mode, or omit it
 * (with `indeterminate`) for an animated shimmer while awaiting the server.
 */
const Progress = React.forwardRef(
  ({ className, value, indeterminate = false, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {indeterminate ? (
        <div className="progress-shimmer animate-shimmer h-full w-full rounded-full opacity-80" />
      ) : (
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
        />
      )}
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
