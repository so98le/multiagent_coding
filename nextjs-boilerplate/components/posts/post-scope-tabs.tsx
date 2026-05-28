import Link from "next/link"

import type { PostScope } from "@/lib/post-management"
import { cn } from "@/lib/utils"

type PostScopeTabsProps = {
  scope: PostScope
}

const tabs = [
  { href: "/dashboard?scope=all", label: "All posts", value: "all" },
  { href: "/dashboard?scope=mine", label: "My posts", value: "mine" },
] as const

export function PostScopeTabs({ scope }: PostScopeTabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const isActive = tab.value === scope

        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={cn(
              "rounded-md border px-3 py-2 text-sm transition",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
