"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react"
import { type DocFrontmatter } from "@/types"

interface DependencyChainProps {
  prerequisites: DocFrontmatter["prerequisites"]
  nextSteps?: { title: string; slug: string }[]
}

export function DependencyChain({ prerequisites, nextSteps }: DependencyChainProps) {
  const hasPrereqs = prerequisites && prerequisites.length > 0
  const hasNext = nextSteps && nextSteps.length > 0

  if (!hasPrereqs && !hasNext) return null

  return (
    <div className="my-8 grid gap-4 md:grid-cols-2">
      {hasPrereqs && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            前置知识
          </div>
          <div className="space-y-2">
            {prerequisites.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="line-clamp-1">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      {hasNext && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            后续延伸
            <ArrowRight className="h-4 w-4" />
          </div>
          <div className="space-y-2">
            {nextSteps.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="line-clamp-1">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
