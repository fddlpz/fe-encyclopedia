"use client"

/**
 * 文件功能说明：
 * 根据当前文章标签计算相似文章，并在正文底部展示相关推荐列表。
 */

import React from "react"
import Link from "next/link"
import { Tag, ArrowUpRight } from "lucide-react"

interface RelatedArticlesProps {
  currentTags: string[]
  currentSlug: string
  allDocs: {
    slug: string
    title: string
    description: string
    tags: string[]
  }[]
}

/**
 * 计算两个标签集合的 Jaccard 相似度。
 * @param a 当前文章标签集合。
 * @param b 候选文章标签集合。
 * @returns 两个集合的相似度，范围为 0 到 1。
 */
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = new Set(Array.from(setA).filter((x) => setB.has(x)))
  const union = new Set([...Array.from(setA), ...Array.from(setB)])
  return intersection.size / union.size
}

/**
 * 渲染与当前文章标签最相似的推荐文章。
 * @param props.currentTags 当前文章标签。
 * @param props.currentSlug 当前文章 slug。
 * @param props.allDocs 全站候选文章列表。
 * @returns React 推荐文章组件；没有推荐时返回 null。
 */
export function RelatedArticles({ currentTags, currentSlug, allDocs }: RelatedArticlesProps) {
  const related = allDocs
    .filter((d) => d.slug !== currentSlug)
    .map((d) => ({
      ...d,
      similarity: jaccardSimilarity(currentTags, d.tags),
      matchedTags: d.tags.filter((t) => currentTags.includes(t)),
    }))
    .filter((d) => d.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)

  if (related.length === 0) return null

  return (
    <div className="my-8 rounded-lg border bg-card p-4">
      <h4 className="mb-3 text-sm font-semibold">相关推荐</h4>
      <div className="space-y-3">
        {related.map((item) => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            className="group flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-accent"
          >
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-primary">{item.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.matchedTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
