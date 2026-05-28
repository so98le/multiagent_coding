import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & { variant?: "default" | "search" | "search-large" }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full text-body-md text-ink placeholder:text-steel transition-colors",
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        // MongoDB text-input style
        variant === "default" && [
          "h-11 rounded-md bg-canvas border border-hairline-strong px-4 py-2",
          "focus:border-brand-green-dark focus:ring-2 focus:ring-brand-green-dark/20",
        ],
        // MongoDB search-pill style
        variant === "search" && [
          "h-11 rounded-md bg-surface border border-hairline-strong px-4 py-2",
          "focus:bg-canvas focus:border-brand-green-dark focus:ring-2 focus:ring-brand-green-dark/20",
        ],
        // MongoDB search-pill-large style (56px)
        variant === "search-large" && [
          "h-14 rounded-md bg-canvas border border-hairline-strong px-5 py-3",
          "focus:border-brand-green-dark focus:ring-2 focus:ring-brand-green-dark/20",
        ],
        className
      )}
      {...props}
    />
  )
}

export { Input }
