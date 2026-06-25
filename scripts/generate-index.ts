import fs from "fs"
import path from "path"
import matter from "gray-matter"

/**
 * 文件功能说明：
 * 扫描 content 目录下的 MDX 文档，生成前端全文搜索使用的结构化索引。
 */

const contentDirectory = path.join(process.cwd(), "content")
const outputPath = path.join(process.cwd(), "public", "search-index.json")

interface SearchDoc {
  slug: string
  title: string
  description: string
  summary: string
  content: string
  tags: string[]
  keywords: string[]
}

/**
 * 提取参与搜索的纯文本内容，并移除代码块以降低索引噪声。
 * @param content MDX 正文内容。
 * @param summary frontmatter 中的文章摘要。
 * @param keywords frontmatter 中的搜索关键词。
 * @returns 截断后的搜索文本。
 */
function buildSearchContent(content: string, summary: string, keywords: string[]): string {
  const plainContent = content.replace(/```[\s\S]*?```/g, "")
  return [summary, keywords.join(" "), plainContent].filter(Boolean).join("\n").slice(0, 7000)
}

/**
 * 递归读取所有文章并生成搜索索引条目。
 * @returns 搜索索引文档列表。
 */
function getAllDocs(): SearchDoc[] {
  const docs: SearchDoc[] = []

  function traverse(dir: string, prefix: string = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        traverse(fullPath, relativePath)
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        const raw = fs.readFileSync(fullPath, "utf-8")
        const { data, content } = matter(raw)
        const slug = relativePath.replace(/\.mdx$/, "")
        const summary = data.summary || data.description || ""
        const keywords = Array.isArray(data.keywords) ? data.keywords : []
        docs.push({
          slug,
          title: data.title || slug,
          description: data.description || "",
          summary,
          content: buildSearchContent(content, summary, keywords),
          tags: data.tags || [],
          keywords,
        })
      }
    }
  }

  if (fs.existsSync(contentDirectory)) {
    traverse(contentDirectory)
  }

  return docs
}

const docs = getAllDocs()
fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(docs, null, 2))
console.log(`Generated search index with ${docs.length} documents`)
