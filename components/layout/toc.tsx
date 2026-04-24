"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TOCItem {
  id: string
  text: string
  level: number
}

export function TOC() {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("h2, h3, h4"))
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: el.textContent || "",
        level: Number(el.tagName[1]),
      }))
    setHeadings(elements)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-80px 0px -40% 0px" }
    )

    elements.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto py-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          目录
        </p>
        <nav className="space-y-1">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={cn(
                "block text-sm transition-colors hover:text-primary",
                heading.level === 2 && "font-medium",
                heading.level === 3 && "ml-3 text-xs",
                heading.level === 4 && "ml-6 text-xs",
                activeId === heading.id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
