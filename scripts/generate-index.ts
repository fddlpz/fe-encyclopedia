import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentDirectory = path.join(process.cwd(), "content")
const outputPath = path.join(process.cwd(), "public", "search-index.json")

interface SearchDoc {
  slug: string
  title: string
  description: string
  content: string
  tags: string[]
}

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
        docs.push({
          slug,
          title: data.title || slug,
          description: data.description || "",
          content: content.replace(/```[\s\S]*?```/g, "").slice(0, 5000),
          tags: data.tags || [],
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
