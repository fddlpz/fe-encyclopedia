import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { type DocFrontmatter, type DocNode } from "@/types"

const contentDirectory = path.join(process.cwd(), "content")

export function getAllDocSlugs(): string[] {
  const slugs: string[] = []

  function traverse(dir: string, prefix: string = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        traverse(fullPath, relativePath)
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        const slug = relativePath.replace(/\.mdx$/, "")
        slugs.push(slug)
      }
    }
  }

  if (fs.existsSync(contentDirectory)) {
    traverse(contentDirectory)
  }

  return slugs
}

export function getDocBySlug(slug: string): DocNode | null {
  const realPath = path.join(contentDirectory, `${slug}.mdx`)
  if (!fs.existsSync(realPath)) return null

  const raw = fs.readFileSync(realPath, "utf-8")
  const { data, content } = matter(raw)

  return {
    slug,
    frontmatter: data as DocFrontmatter,
    content,
  }
}

export function getAllDocs(): DocNode[] {
  const slugs = getAllDocSlugs()
  return slugs
    .map((slug) => getDocBySlug(slug))
    .filter((doc): doc is DocNode => doc !== null)
}

export function getDocsByVolume(volumeSlug: string): DocNode[] {
  return getAllDocs().filter((doc) => doc.slug.startsWith(volumeSlug))
}

export function getDocsByChapter(chapterSlug: string): DocNode[] {
  return getAllDocs().filter((doc) => doc.slug.startsWith(chapterSlug))
}

export function getAdjacentDocs(slug: string): { prev: DocNode | null; next: DocNode | null } {
  const all = getAllDocs().sort((a, b) => {
    const sa = a.frontmatter.section || ""
    const sb = b.frontmatter.section || ""
    return sa.localeCompare(sb, undefined, { numeric: true })
  })

  const idx = all.findIndex((d) => d.slug === slug)
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  }
}
