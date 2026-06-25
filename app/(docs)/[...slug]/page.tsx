import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { type Pluggable } from "unified"
import remarkGfm from "remark-gfm"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getDocBySlug, getAllDocSlugs, getAdjacentDocs, getAllDocs } from "@/lib/mdx"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { TOC } from "@/components/layout/toc"
import { mdxComponents } from "@/components/content/mdx-components"
import { KnowledgeGraph } from "@/components/content/knowledge-graph"
import { DependencyChain } from "@/components/content/dependency-chain"
import { RelatedArticles } from "@/components/content/related-articles"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { type DocNode } from "@/types"

/**
 * 文件功能说明：
 * 渲染单篇 MDX 文档详情页，包含正文、目录、知识图谱、依赖链、相关推荐和上下篇导航。
 */

interface DocReference {
  title: string
  slug: string
}

/** 代码高亮插件配置：固定深色主题，保证亮色/暗色页面中代码都具有足够对比度。 */
const prettyCodePlugin: Pluggable = [
  rehypePrettyCode,
  {
    theme: "github-dark",
    keepBackground: false,
  },
]

/**
 * MDX 编译配置说明：
 * next-mdx-remote/rsc 不会自动读取 next.config.js 中的 @next/mdx 配置，
 * 因此表格、任务列表和代码高亮需要在运行时渲染入口显式注册。
 */
const mdxRemoteOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      prettyCodePlugin,
    ],
  },
}

/**
 * 将 frontmatter 中不同格式的章节引用统一转换为可点击链接。
 * @param ref 原始引用，兼容字符串、slug 对象和 title/slug 对象。
 * @param allDocs 全站文档列表，用于把短 slug 解析为完整 slug。
 * @returns 可渲染的章节引用；无法解析时返回 null。
 */
function normalizeDocReference(ref: unknown, allDocs: DocNode[]): DocReference | null {
  if (!ref) return null

  const rawSlug =
    typeof ref === "string"
      ? ref
      : typeof ref === "object" && "slug" in ref
        ? String((ref as { slug?: unknown }).slug || "")
        : ""

  const cleanSlug = rawSlug.replace(/\.mdx$/, "").replace(/^\/+/, "")
  if (!cleanSlug) return null

  const matchedDoc =
    allDocs.find((doc) => doc.slug === cleanSlug) ||
    allDocs.find((doc) => doc.slug.endsWith(`/${cleanSlug}`)) ||
    allDocs.find((doc) => pathBasename(doc.slug) === cleanSlug)

  if (matchedDoc) {
    return {
      title:
        typeof ref === "object" && "title" in ref
          ? String((ref as { title?: unknown }).title || matchedDoc.frontmatter.title)
          : matchedDoc.frontmatter.title,
      slug: matchedDoc.slug,
    }
  }

  if (typeof ref === "object" && "title" in ref) {
    return {
      title: String((ref as { title?: unknown }).title || cleanSlug),
      slug: cleanSlug,
    }
  }

  return null
}

/**
 * 获取 slug 的最后一段文件名。
 * @param slug 文档 slug。
 * @returns slug 最后一段。
 */
function pathBasename(slug: string): string {
  const parts = slug.split("/")
  return parts[parts.length - 1] || slug
}

/**
 * 批量归一化引用数组，并去除无法解析的条目。
 * @param refs frontmatter 中的引用数组。
 * @param allDocs 全站文档列表。
 * @returns 可渲染引用数组。
 */
function normalizeDocReferences(refs: unknown[] | undefined, allDocs: DocNode[]): DocReference[] {
  return (refs || [])
    .map((ref) => normalizeDocReference(ref, allDocs))
    .filter((ref): ref is DocReference => ref !== null)
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return slugs.map((slug) => ({ slug: slug.split("/") }))
}

export function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join("/")
  const doc = getDocBySlug(slug)
  if (!doc) return {}
  return {
    title: `${doc.frontmatter.title} | 前端开发百科全书`,
    description: doc.frontmatter.description,
  }
}

export default function DocPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join("/")
  const doc = getDocBySlug(slug)
  if (!doc) return notFound()

  const { frontmatter, content } = doc
  const { prev, next } = getAdjacentDocs(slug)
  const allDocNodes = getAllDocs()
  const prerequisiteReferences = normalizeDocReferences(frontmatter.prerequisites as unknown[] | undefined, allDocNodes)
  const relatedReferences = normalizeDocReferences(frontmatter.related as unknown[] | undefined, allDocNodes)
  const crossReferences = normalizeDocReferences(frontmatter.crossRefs as unknown[] | undefined, allDocNodes)

  // Build breadcrumb
  const breadcrumbItems = [
    { label: frontmatter.volume, href: undefined },
    { label: frontmatter.chapter, href: undefined },
    { label: frontmatter.title },
  ]

  // Build graph data
  const currentNode = {
    id: slug,
    title: frontmatter.title,
    group: "current" as const,
    slug,
  }
  const relatedNodes = relatedReferences.map((r) => ({
    id: r.slug,
    title: r.title,
    group: "related" as const,
    slug: r.slug,
  }))
  const crossNodes = crossReferences.map((r) => ({
    id: r.slug,
    title: r.title,
    group: "cross" as const,
    slug: r.slug,
  }))
  const graphNodes = [currentNode, ...relatedNodes, ...crossNodes]
  const graphLinks = [
    ...relatedNodes.map((n) => ({ source: slug, target: n.id, type: "related" as const })),
    ...crossNodes.map((n) => ({ source: slug, target: n.id, type: "cross" as const })),
  ]

  // All docs for related articles
  const allDocs = allDocNodes.map((d) => ({
    slug: d.slug,
    title: d.frontmatter.title,
    description: d.frontmatter.description,
    tags: d.frontmatter.tags || [],
  }))

  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{frontmatter.title}</h1>
          <p className="mt-2 text-muted-foreground">{frontmatter.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {frontmatter.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="prose-custom">
          <MDXRemote source={content} components={mdxComponents} options={mdxRemoteOptions} />
        </div>

        <Separator className="my-8" />

        {/* Knowledge diffusion */}
        <KnowledgeGraph nodes={graphNodes} links={graphLinks} />

        <DependencyChain
          prerequisites={prerequisiteReferences}
          nextSteps={relatedReferences.slice(0, 3)}
        />

        <RelatedArticles
          currentTags={frontmatter.tags || []}
          currentSlug={slug}
          allDocs={allDocs}
        />

        {/* Prev/Next */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {prev ? (
            <Button variant="outline" className="h-auto py-2 px-3" asChild>
              <Link href={`/${prev.slug}`} className="flex items-start gap-2">
                <ArrowLeft className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground">上一篇</p>
                  <p className="text-sm font-medium">{prev.frontmatter.title}</p>
                </div>
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {next ? (
            <Button variant="outline" className="h-auto py-2 px-3" asChild>
              <Link href={`/${next.slug}`} className="flex items-start gap-2">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">下一篇</p>
                  <p className="text-sm font-medium">{next.frontmatter.title}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </article>

      <TOC />
    </div>
  )
}
