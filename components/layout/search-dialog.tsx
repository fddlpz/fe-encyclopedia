"use client"

/**
 * 文件功能说明：
 * 渲染全站搜索弹窗，加载静态搜索索引并在客户端执行全文检索。
 */

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Search, FileText, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type SearchResult } from "@/types"

/**
 * FlexSearch 文档索引实例的最小接口。
 * 只描述当前搜索弹窗实际使用的 add 和 search 能力，避免和浏览器原生 Document 类型混淆。
 */
type ClientSearchIndex = {
  add: (item: unknown) => void
  search: (query: string, options: { enrich: true }) => Array<{
    result: Array<{
      doc: {
        title: string
        slug: string
        description: string
        tags?: string[]
      }
    }>
  }>
}

/**
 * FlexSearch 文档构造器类型。
 * @param options FlexSearch 文档索引配置。
 * @returns 客户端全文搜索索引实例。
 */
type FlexSearchDocumentConstructor = new (options: Record<string, unknown>) => ClientSearchIndex

/**
 * 渲染搜索弹窗并管理搜索索引加载、输入关键字和结果列表。
 * @returns React 搜索弹窗组件。
 */
export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [index, setIndex] = useState<ClientSearchIndex | null>(null)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

  useEffect(() => {
    fetch(`${basePath}/search-index.json`)
      .then((res) => res.json())
      .then((data) => {
        import("flexsearch").then((flexSearchModule) => {
          const moduleShape = flexSearchModule as unknown as {
            Document?: FlexSearchDocumentConstructor
            default?: { Document?: FlexSearchDocumentConstructor }
          }
          const SearchDocument = moduleShape.Document ?? moduleShape.default?.Document

          if (typeof SearchDocument !== "function") {
            return
          }

          const doc = new SearchDocument({
            document: {
              id: "slug",
              index: ["title", "description", "content", "tags"],
              store: ["title", "description", "tags", "slug"],
            },
            tokenize: "full",
          })

          // 中文注释：搜索索引数据来自构建期生成的静态 JSON，客户端只负责载入并建立内存索引。
          data.forEach((item: unknown) => doc.add(item))
          setIndex(doc)
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!index || !query.trim()) {
      setResults([])
      return
    }
    const found = index.search(query, { enrich: true })
    const map = new Map<string, SearchResult>()
    found.forEach((field) => {
      field.result.forEach((item) => {
        const doc = item.doc
        if (!map.has(doc.slug)) {
          map.set(doc.slug, {
            title: doc.title,
            slug: doc.slug,
            description: doc.description,
            tags: doc.tags || [],
            excerpt: doc.description,
          })
        }
      })
    })
    setResults(Array.from(map.values()).slice(0, 8))
  }, [query, index])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative h-9 w-full justify-start rounded-md bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64">
          <Search className="mr-2 h-3.5 w-3.5" />
          搜索...
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="sr-only">搜索文档</DialogTitle>
        </DialogHeader>
        <div className="border-b px-4 pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索标题、标签、内容..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 && query.trim() && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              未找到相关内容
            </p>
          )}
          {results.length === 0 && !query.trim() && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              输入关键词开始搜索，或按 Ctrl+K 快捷键
            </p>
          )}
          {results.map((result) => (
            <Link
              key={result.slug}
              href={`/${result.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-4 py-3 hover:bg-accent"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{result.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {result.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.tags.slice(0, 3).map((tag) => (
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
      </DialogContent>
    </Dialog>
  )
}
