import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_24px_-6px_hsl(142_70%_49%_/_0.5)] hover:bg-[hsl(142,70%,55%)] hover:shadow-[0_0_32px_-4px_hsl(142_70%_49%_/_0.6)]",
        success:
          "bg-success text-success-foreground shadow-[0_0_24px_-6px_hsl(142_70%_45%_/_0.5)] hover:bg-[hsl(142,70%,52%)] hover:shadow-[0_0_32px_-4px_hsl(142_70%_45%_/_0.65)]",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-muted hover:text-foreground",
        outline:
          "border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-[hsl(160,9%,22%)]",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
