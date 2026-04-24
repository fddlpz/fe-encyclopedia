"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type VolumeNode } from "@/types"

interface SidebarProps {
  navigation: VolumeNode[]
}

export function Sidebar({ navigation }: SidebarProps) {
  const pathname = usePathname()
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(() => {
    const set = new Set<string>()
    navigation.forEach((v) => set.add(v.slug))
    return set
  })
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => {
    const set = new Set<string>()
    navigation.forEach((v) =>
      v.chapters.forEach((c) => {
        if (c.sections.some((s) => pathname?.includes(s.slug))) {
          set.add(c.slug)
        }
      })
    )
    return set
  })

  const toggleVolume = (slug: string) => {
    setExpandedVolumes((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const toggleChapter = (slug: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  return (
    <aside className="fixed top-16 z-30 hidden h-[calc(100vh-4rem)] w-72 shrink-0 border-r bg-background lg:block">
      <ScrollArea className="h-full py-6 pr-4">
        <div className="px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
          >
            <BookOpen className="h-4 w-4" />
            返回首页
          </Link>
          <div className="my-4 border-t" />
        </div>
        <nav className="space-y-1 px-2">
          {navigation.map((volume) => (
            <div key={volume.slug}>
              <button
                onClick={() => toggleVolume(volume.slug)}
                className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-accent"
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform",
                    expandedVolumes.has(volume.slug) && "rotate-90"
                  )}
                />
                <span className="truncate">{volume.title}</span>
              </button>
              {expandedVolumes.has(volume.slug) && (
                <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                  {volume.chapters.map((chapter) => (
                    <div key={chapter.slug}>
                      <button
                        onClick={() => toggleChapter(chapter.slug)}
                        className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 shrink-0 transition-transform",
                            expandedChapters.has(chapter.slug) && "rotate-90"
                          )}
                        />
                        <span className="truncate">{chapter.title}</span>
                      </button>
                      {expandedChapters.has(chapter.slug) && (
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          {chapter.sections.map((section) => {
                            const isActive = pathname === `/${section.slug}`
                            return (
                              <Link
                                key={section.slug}
                                href={`/${section.slug}`}
                                className={cn(
                                  "block rounded-md px-2 py-1 text-xs transition-colors",
                                  isActive
                                    ? "bg-primary/10 font-medium text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                              >
                                {section.title}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
