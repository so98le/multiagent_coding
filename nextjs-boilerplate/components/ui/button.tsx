import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center bg-clip-padding text-button-md whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // MongoDB Primary - Bright green pill CTA
        default: "rounded-full bg-brand-green text-on-primary hover:bg-brand-green/90 active:bg-brand-green-dark",
        // MongoDB Secondary - Outlined pill
        secondary: "rounded-full bg-transparent text-ink border border-hairline-strong hover:bg-surface hover:border-ink",
        // MongoDB On Dark - Bright green pill on dark hero bands
        "on-dark": "rounded-full bg-brand-green text-on-primary hover:bg-brand-green/90",
        // MongoDB Secondary On Dark - Outlined pill on dark backgrounds
        "secondary-on-dark": "rounded-full bg-transparent text-on-dark border border-hairline-dark hover:bg-white/10",
        // MongoDB Ghost - Quieter rectangular button
        ghost: "rounded-md bg-transparent text-ink hover:bg-surface active:bg-surface-soft",
        // MongoDB Link - Inline green text link
        link: "text-brand-green-dark underline-offset-4 hover:underline p-0",
        // Destructive
        destructive: "rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20",
        // Outline (shadcn compatibility)
        outline: "rounded-lg border border-hairline bg-canvas text-ink hover:bg-surface hover:text-foreground",
      },
      size: {
        default: "h-10 gap-2 px-[22px] py-[10px]",
        sm: "h-8 gap-1.5 px-4 py-2 text-[13px]",
        lg: "h-12 gap-2 px-7 py-3",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
