import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center text-caption-bold whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        // MongoDB badge-green - Bright green for new product highlights
        default: "rounded-sm bg-brand-green text-on-primary px-2 py-0.5",
        // MongoDB badge-green-soft - Pale mint pill for success/free indicators
        success: "rounded-full bg-brand-green-soft text-brand-green-dark px-2.5 py-1",
        // MongoDB badge-purple - Purple course category tag
        purple: "rounded-sm bg-accent-purple text-on-dark px-2 py-0.5",
        // MongoDB badge-orange - Orange course category tag
        orange: "rounded-sm bg-accent-orange text-on-dark px-2 py-0.5",
        // MongoDB badge-popular - "Most Popular" tier indicator
        popular: "rounded-full bg-brand-teal-deep text-brand-green px-2.5 py-1",
        // Blue category tag
        blue: "rounded-sm bg-accent-blue text-on-dark px-2 py-0.5",
        // Pink category tag
        pink: "rounded-sm bg-accent-pink text-on-dark px-2 py-0.5",
        // Teal category tag
        teal: "rounded-sm bg-brand-teal text-on-dark px-2 py-0.5",
        // Secondary badge
        secondary: "rounded-full bg-surface text-slate px-2.5 py-1",
        // Outline badge
        outline: "rounded-full border border-hairline text-slate px-2.5 py-1",
        // Destructive badge
        destructive: "rounded-full bg-destructive/10 text-destructive px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
