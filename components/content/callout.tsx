import React from "react"
import { Info, AlertTriangle, Lightbulb, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalloutProps {
  children: React.ReactNode
  type?: "info" | "warning" | "tip" | "danger"
  title?: string
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  danger: XCircle,
}

const styles = {
  info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
  tip: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
  danger: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100",
}

const iconStyles = {
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-400",
  tip: "text-emerald-600 dark:text-emerald-400",
  danger: "text-red-600 dark:text-red-400",
}

export function Callout({ children, type = "info", title }: CalloutProps) {
  const Icon = icons[type]

  return (
    <div className={cn("my-6 rounded-lg border px-4 py-3", styles[type])}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconStyles[type])} />
        <div className="flex-1">
          {title && (
            <p className="mb-1 font-semibold">{title}</p>
          )}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
