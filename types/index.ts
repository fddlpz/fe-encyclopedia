export interface DocFrontmatter {
  title: string
  description: string
  volume: string
  chapter: string
  section: string
  tags: string[]
  difficulty: "基础" | "进阶" | "高级"
  prerequisites: { title: string; slug: string }[]
  related: { title: string; slug: string }[]
  crossRefs: { title: string; slug: string }[]
  lastUpdated: string
}

export interface DocNode {
  slug: string
  frontmatter: DocFrontmatter
  content: string
}

export interface ChapterNode {
  title: string
  slug: string
  sections: SectionNode[]
}

export interface SectionNode {
  title: string
  slug: string
  section: string
}

export interface VolumeNode {
  title: string
  slug: string
  description: string
  chapters: ChapterNode[]
}

export interface SearchResult {
  title: string
  slug: string
  description: string
  tags: string[]
  excerpt: string
}

export interface GraphNode {
  id: string
  title: string
  group: "current" | "related" | "chapter" | "cross"
  slug: string
}

export interface GraphLink {
  source: string
  target: string
  type: "related" | "cross" | "chapter"
}
