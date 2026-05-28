import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tabsVariants = cva("", {
  variants: {
    variant: {
      // MongoDB pill-tab style
      pill: "inline-flex gap-2 p-1 rounded-full bg-surface",
      // MongoDB segmented-tab (underline) style
      segmented: "inline-flex gap-4 border-b border-hairline",
    },
  },
  defaultVariants: {
    variant: "pill",
  },
})

function Tabs({
  className,
  variant = "pill",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof tabsVariants>) {
  return (
    <div
      data-slot="tabs"
      data-variant={variant}
      role="tablist"
      className={cn(tabsVariants({ variant }), className)}
      {...props}
    />
  )
}

const tabVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-body-sm-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // MongoDB pill-tab style
        pill: [
          "rounded-full px-4 py-1.5",
          "text-steel border border-transparent hover:text-ink",
          "data-[state=active]:bg-ink data-[state=active]:text-on-dark data-[state=active]:border-ink",
        ],
        // MongoDB segmented-tab (underline) style
        segmented: [
          "px-1 py-3 -mb-px",
          "text-steel hover:text-ink border-b-2 border-transparent",
          "data-[state=active]:text-brand-green-dark data-[state=active]:border-brand-green-dark",
        ],
      },
    },
    defaultVariants: {
      variant: "pill",
    },
  }
)

function Tab({
  className,
  variant = "pill",
  active = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof tabVariants> & { active?: boolean }) {
  return (
    <button
      data-slot="tab"
      role="tab"
      data-state={active ? "active" : "inactive"}
      aria-selected={active}
      className={cn(tabVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tab-content"
      role="tabpanel"
      className={cn("mt-4", className)}
      {...props}
    />
  )
}

export { Tabs, Tab, TabContent, tabsVariants, tabVariants }
