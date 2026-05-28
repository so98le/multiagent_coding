import * as React from "react"

import { cn } from "@/lib/utils"

// MongoDB code-block component
function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<"pre">) {
  return (
    <pre
      data-slot="code-block"
      className={cn(
        "rounded-md bg-canvas-dark text-on-dark text-code-md p-4 overflow-x-auto",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  )
}

// MongoDB code-mockup-card component - for hero bands
function CodeMockupCard({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"div"> & { title?: string }) {
  return (
    <div
      data-slot="code-mockup-card"
      className={cn(
        "rounded-lg bg-canvas-dark text-on-dark p-6 shadow-mockup",
        className
      )}
      {...props}
    >
      {title && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-hairline-dark">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-body-sm text-on-dark-muted ml-2">{title}</span>
        </div>
      )}
      <pre className="text-code-md overflow-x-auto">{children}</pre>
    </div>
  )
}

// Inline code element
function Code({
  className,
  ...props
}: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="code"
      className={cn(
        "rounded-sm bg-surface px-1.5 py-0.5 text-code-md text-charcoal",
        className
      )}
      {...props}
    />
  )
}

export { CodeBlock, CodeMockupCard, Code }
