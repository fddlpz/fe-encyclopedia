"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, FileText, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type SearchResult } from "@/types"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [index, setIndex] = useState<any>(null)

  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data) => {
        import("flexsearch").then(({ Document }) => {
          const doc = new Document({
            document: {
              id: "slug",
              index: ["title", "description", "content", "tags"],
              store: ["title", "description", "tags", "slug"],
            },
            tokenize: "full",
          })
          data.forEach((item: any) => doc.add(item))
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
    found.forEach((field: any) => {
      field.result.forEach((item: any) => {
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
