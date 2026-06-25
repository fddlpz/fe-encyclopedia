export type DocStatus = "草稿" | "框架重构" | "基本完成" | "已完成"

export type DocDifficulty = "基础" | "进阶" | "高级"

export interface DocReference {
  title: string
  slug: string
}

export interface ExternalReference {
  title: string
  url: string
}

export interface DocFrontmatter {
  title: string
  description: string
  volume: string
  chapter: string
  section: string
  status: DocStatus
  tags: string[]
  difficulty: DocDifficulty
  keywords?: string[]
  summary?: string
  learningGoals?: string[]
  prerequisites: DocReference[]
  related: DocReference[]
  crossRefs: DocReference[]
  references?: ExternalReference[]
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
