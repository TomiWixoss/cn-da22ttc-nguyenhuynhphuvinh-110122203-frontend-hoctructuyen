import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-[1.02] active:scale-[0.98] transform-gpu cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 [&.is-3d]:border-primary-foreground/30 [&.is-3d]:after:from-white/40 [&.is-3d]:bg-gradient-to-b [&.is-3d]:from-primary-foreground/5 [&.is-3d]:to-transparent",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 [&.is-3d]:border-destructive-foreground/30 [&.is-3d]:after:from-white/30 [&.is-3d]:bg-gradient-to-b [&.is-3d]:from-white/10 [&.is-3d]:to-transparent",
        outline:
          "border-2 bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 dark:hover:text-foreground [&.is-3d]:border-accent/30 [&.is-3d]:after:from-white/30 [&.is-3d]:bg-gradient-to-b [&.is-3d]:from-accent/5 [&.is-3d]:to-transparent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 [&.is-3d]:border-secondary-foreground/30 [&.is-3d]:after:from-white/30 [&.is-3d]:bg-gradient-to-b [&.is-3d]:from-secondary-foreground/5 [&.is-3d]:to-transparent",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      is3DNoLayout: {
        true: "relative transition-all duration-200 ease-out transform -translate-y-0 hover:-translate-y-1 active:translate-y-0 shadow-[0_5px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.4)] active:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] dark:shadow-[0_5px_0_0_rgba(255,255,255,0.15)] dark:hover:shadow-[0_6px_0_0_rgba(255,255,255,0.2)] dark:active:shadow-[0_2px_0_0_rgba(255,255,255,0.1)] hover:scale-[1.01] active:scale-[0.99] rounded-md overflow-visible",
        false: "transition-transform duration-200",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 py-3 text-base has-[>svg]:px-6",
        "2xl": "h-14 rounded-lg px-10 py-4 text-lg has-[>svg]:px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      is3DNoLayout: false,
    },
  }
);

function Button({
  className,
  variant,
  size,
  is3DNoLayout = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    is3D?: boolean;
    is3DNoLayout?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, is3DNoLayout, className }),
        is3DNoLayout && "is-3d-no-layout"
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
