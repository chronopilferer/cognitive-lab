import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
const variants = cva("button", {
  variants: {
    variant: { primary: "primary", secondary: "secondary", ghost: "ghost" },
  },
  defaultVariants: { variant: "primary" },
});
export function Button({
  asChild = false,
  variant,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof variants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";
  return (
    <Component className={`${variants({ variant })} ${className}`} {...props} />
  );
}
