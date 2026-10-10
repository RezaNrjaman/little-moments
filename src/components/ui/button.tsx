import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-pink text-ink shadow-soft hover:bg-pink-strong hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-lavender text-ink shadow-soft hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0",
        mint: "bg-mint text-ink shadow-soft hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-ink/15 bg-white/70 text-ink hover:bg-white hover:-translate-y-0.5",
        ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
        danger: "bg-[#f27d8d] text-white shadow-soft hover:brightness-105",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
