import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface VolumeCardProps {
  number: number
  title: string
  description: string
  slug: string
  chapterCount: number
}

export function VolumeCard({ number, title, description, slug, chapterCount }: VolumeCardProps) {
  return (
    <Link
      href={`/${slug}`}
      className="group relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          {number}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="mb-3 flex-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
      <p className="text-xs text-muted-foreground">{chapterCount} 章</p>
    </Link>
  )
}
