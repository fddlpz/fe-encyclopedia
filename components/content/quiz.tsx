"use client"

/**
 * 文件功能说明：
 * 渲染 MDX 文档中的随堂问答组件，兼容简答题和选择题两种写法。
 */

import React, { useState } from "react"
import { CheckCircle2, ChevronDown, HelpCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizProps {
  /** 问题文本：展示在组件标题区域。 */
  question: string
  /** 简答题答案：旧版 MDX 使用该字段。 */
  answer?: React.ReactNode
  /** 题目类型：用于控制视觉标签颜色。 */
  type?: "原理" | "代码" | "设计"
  /** 选择题选项：现有完整文章大量使用该字段。 */
  options?: React.ReactNode[]
  /** 正确选项索引：与 options 配套使用，从 0 开始。 */
  correctIndex?: number
  /** 选择题解析：展开答案后展示。 */
  explanation?: React.ReactNode
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

/**
 * 渲染可展开的问答卡片。
 * @param props.question 问题文本。
 * @param props.answer 简答题答案。
 * @param props.type 题目类型。
 * @param props.options 选择题选项。
 * @param props.correctIndex 正确选项索引。
 * @param props.explanation 选择题解析。
 * @returns React 问答组件。
 */
export function Quiz({
  question,
  answer,
  type = "原理",
  options,
  correctIndex,
  explanation,
}: QuizProps) {
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const hasOptions = Array.isArray(options) && options.length > 0
  const hasCorrectIndex = typeof correctIndex === "number"

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
      {hasOptions && (
        <div className="space-y-2 border-t px-4 py-3">
          {options.map((option, index) => {
            const isSelected = selectedIndex === index
            const isCorrect = hasCorrectIndex && correctIndex === index
            const showResult = open || selectedIndex !== null

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedIndex(index)
                  setOpen(true)
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md border bg-background/70 px-3 py-2 text-left text-sm transition-colors hover:bg-background",
                  showResult && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
                  showResult && isSelected && !isCorrect && "border-red-400 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100"
                )}
              >
                {showResult && isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : showResult && isSelected ? (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]">
                    {index + 1}
                  </span>
                )}
                <span>{option}</span>
              </button>
            )
          })}
        </div>
      )}
      {open && (
        <div className="border-t px-4 py-3 text-sm leading-relaxed">
          <p className="font-semibold mb-1">解答：</p>
          {hasOptions ? explanation || "暂无解析。" : answer || "暂无解答。"}
        </div>
      )}
    </div>
  )
}
