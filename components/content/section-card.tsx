import React from "react"
import { cn } from "@/lib/utils"

interface SectionCardProps {
  children: React.ReactNode
  variant?: "principle" | "usage" | "practice" | "pitfall"
  title?: string
}

const variants = {
  principle: {
    border: "border-l-4 border-l-blue-500",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    label: "原理",
  },
  usage: {
    border: "border-l-4 border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    label: "用法",
  },
  practice: {
    border: "border-l-4 border-l-amber-500",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    label: "实践",
  },
  pitfall: {
    border: "border-l-4 border-l-red-500",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    label: "陷阱",
  },
}

export function SectionCard({ children, variant = "principle", title }: SectionCardProps) {
  const style = variants[variant]

  return (
    <div className={cn("my-8 rounded-r-lg border bg-card p-6 shadow-sm", style.border)}>
      <div className="mb-4 flex items-center gap-2">
        <span className={cn("rounded px-2 py-0.5 text-xs font-semibold", style.badge)}>
          {style.label}
        </span>
        {title && (
          <h3 className="text-lg font-semibold">{title}</h3>
        )}
      </div>
      <div className="prose-custom">{children}</div>
    </div>
  )
}
