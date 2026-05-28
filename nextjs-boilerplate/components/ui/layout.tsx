import * as React from "react"

import { cn } from "@/lib/utils"

// MongoDB hero-band-dark component
function HeroBand({
  className,
  variant = "dark",
  children,
  ...props
}: React.ComponentProps<"section"> & { variant?: "dark" | "light" }) {
  return (
    <section
      data-slot="hero-band"
      className={cn(
        "py-20 md:py-24 lg:py-32",
        variant === "dark" && "bg-brand-teal-deep text-on-dark",
        variant === "light" && "bg-canvas text-ink",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-6 max-w-[1280px]">
        {children}
      </div>
    </section>
  )
}

// MongoDB promo-banner component
function PromoBanner({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="promo-banner"
      className={cn(
        "bg-brand-teal-deep text-on-dark text-body-sm-medium py-2 px-4 text-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// MongoDB CTA banner dark
function CTABanner({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="cta-banner"
      className={cn(
        "rounded-lg bg-brand-teal-deep text-on-dark py-16 px-8 text-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Container component with MongoDB max-width
function Container({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="container"
      className={cn("mx-auto px-6 md:px-8 max-w-[1280px]", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Section component with proper spacing
function Section({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"section"> & { variant?: "default" | "tight" }) {
  return (
    <section
      data-slot="section"
      className={cn(
        variant === "default" && "py-16 md:py-24",
        variant === "tight" && "py-12 md:py-16",
        className
      )}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  )
}

export { HeroBand, PromoBanner, CTABanner, Container, Section }
