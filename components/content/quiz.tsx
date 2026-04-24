"use client"

import React, { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizProps {
  question: string
  answer: string
  type?: "原理" | "代码" | "设计"
}

const typeStyles = {
  "原理": "bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100",
  "代码": "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
  "设计": "bg-purple-50 text-purple-900 dark:bg-purple-950/30 dark:text-purple-100",
}

const badgeStyles = {
  "原理": "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  "代码": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  "设计": "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
}

export function Quiz({ question, answer, type = "原理" }: QuizProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("my-6 rounded-lg border", typeStyles[type])}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <HelpCircle className="h-5 w-5 shrink-0" />
        <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold", badgeStyles[type])}>
          {type}题
        </span>
        <span className="flex-1 text-sm font-medium">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="border-t px-4 py-3 text-sm leading-relaxed">
          <p className="font-semibold mb-1">解答：</p>
          {answer}
        </div>
      )}
    </div>
  )
}
