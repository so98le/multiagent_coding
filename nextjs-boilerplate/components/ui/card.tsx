import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "feature" | "dark" | "featured" | "course" }) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-lg text-body-md",
        // Default card - MongoDB card-base style
        variant === "default" && "bg-canvas border border-hairline p-6",
        // Feature card - larger padding
        variant === "feature" && "bg-canvas border border-hairline p-8",
        // Dark card - for hero bands
        variant === "dark" && "bg-brand-teal-deep text-on-dark p-8",
        // Featured pricing card - mint background with green border
        variant === "featured" && "bg-surface-feature border-2 border-brand-green p-8",
        // Course card
        variant === "course" && "bg-canvas border border-hairline p-6",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-heading-5 text-ink group-data-[variant=dark]/card:text-on-dark",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-body-sm text-slate group-data-[variant=dark]/card:text-on-dark-muted",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-4 pt-4 border-t border-hairline group-data-[variant=dark]/card:border-hairline-dark",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
