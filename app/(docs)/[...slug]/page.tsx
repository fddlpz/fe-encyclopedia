import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getDocBySlug, getAllDocSlugs, getAdjacentDocs, getAllDocs } from "@/lib/mdx"
import { getNavigationTree } from "@/lib/navigation"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { TOC } from "@/components/layout/toc"
import { mdxComponents } from "@/components/content/mdx-components"
import { KnowledgeGraph } from "@/components/content/knowledge-graph"
import { DependencyChain } from "@/components/content/dependency-chain"
import { RelatedArticles } from "@/components/content/related-articles"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
  const relatedNodes = (frontmatter.related || []).map((r) => ({
    id: r.slug,
    title: r.title,
    group: "related" as const,
    slug: r.slug,
  }))
  const crossNodes = (frontmatter.crossRefs || []).map((r) => ({
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
  const allDocs = getAllDocs().map((d) => ({
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
          <MDXRemote source={content} components={mdxComponents} />
        </div>

        <Separator className="my-8" />

        {/* Knowledge diffusion */}
        <KnowledgeGraph nodes={graphNodes} links={graphLinks} />

        <DependencyChain
          prerequisites={frontmatter.prerequisites || []}
          nextSteps={frontmatter.related?.slice(0, 3)}
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
