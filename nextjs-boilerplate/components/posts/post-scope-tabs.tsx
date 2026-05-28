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
    <div className="inline-flex gap-2 p-1 rounded-full bg-surface">
      {tabs.map((tab) => {
        const isActive = tab.value === scope

        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-body-sm-medium transition-all",
              isActive
                ? "bg-ink text-on-dark"
                : "text-steel hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
