import fs from "fs"
import path from "path"
import matter from "gray-matter"

/**
 * 文件功能说明：
 * 校验全部 MDX 文章是否符合 V2 文章结构、元数据和引用完整性要求。
 */

const contentDirectory = path.join(process.cwd(), "content")

const requiredFrontmatterFields = [
  "title",
  "description",
  "volume",
  "chapter",
  "section",
  "status",
  "difficulty",
  "tags",
  "keywords",
  "summary",
  "learningGoals",
  "prerequisites",
  "related",
  "crossRefs",
  "references",
  "lastUpdated",
] as const

const allowedStatuses = new Set(["草稿", "框架重构", "基本完成", "已完成"])
const allowedDifficulties = new Set(["基础", "进阶", "高级"])

const requiredHeadings = [
  "速览",
  "背景与问题",
  "核心概念",
  "工作原理",
  "代码示例",
  "工程实践",
  "常见误区",
  "对比总结",
  "自测题",
  "参考资料",
]

interface ContentFile {
  absolutePath: string
  relativePath: string
  slug: string
}

interface CheckIssue {
  file: string
  message: string
}

/**
 * 递归收集 content 目录下所有 MDX 文件。
 * @param dir 当前扫描目录。
 * @param prefix 相对 content 目录的路径前缀。
 * @returns MDX 文件元信息列表。
 */
function collectMdxFiles(dir: string, prefix = ""): ContentFile[] {
  const files: ContentFile[] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name)
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      files.push(...collectMdxFiles(absolutePath, relativePath))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push({
        absolutePath,
        relativePath,
        slug: relativePath.replace(/\.mdx$/, ""),
      })
    }
  }

  return files
}

/**
 * 获取正文中的二级标题。
 * @param content MDX 正文。
 * @returns 二级标题文本列表。
 */
function extractH2Headings(content: string): string[] {
  return Array.from(content.matchAll(/^##\s+(.+)$/gm)).map((match) => match[1].trim())
}

/**
 * 判断引用数组是否符合 title/slug 结构。
 * @param value 待检查的 frontmatter 字段值。
 * @returns 是否为有效文档引用数组。
 */
function isDocReferenceArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => {
    return (
      item &&
      typeof item === "object" &&
      typeof (item as { title?: unknown }).title === "string" &&
      typeof (item as { slug?: unknown }).slug === "string"
    )
  })
}

/**
 * 判断参考资料数组是否符合 title/url 结构。
 * @param value 待检查的 frontmatter 字段值。
 * @returns 是否为有效外部参考数组。
 */
function isExternalReferenceArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((item) => {
    return (
      item &&
      typeof item === "object" &&
      typeof (item as { title?: unknown }).title === "string" &&
      typeof (item as { url?: unknown }).url === "string" &&
      /^https?:\/\//.test((item as { url: string }).url)
    )
  })
}

/**
 * 校验文章引用中的 slug 是否能在当前仓库中找到。
 * @param fieldName 引用字段名称。
 * @param value 引用数组。
 * @param knownSlugs 全站 slug 集合。
 * @param file 当前文件路径。
 * @returns 引用校验问题列表。
 */
function validateReferenceSlugs(
  fieldName: string,
  value: unknown,
  knownSlugs: Set<string>,
  file: string
): CheckIssue[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => item && typeof item === "object" && "slug" in item)
    .flatMap((item) => {
      const rawSlug = String((item as { slug?: unknown }).slug || "").replace(/\.mdx$/, "").replace(/^\/+/, "")
      if (!rawSlug || knownSlugs.has(rawSlug)) return []

      return [{
        file,
        message: `${fieldName} 存在无效 slug：${rawSlug}`,
      }]
    })
}

/**
 * 校验单篇文章的 frontmatter 和正文结构。
 * @param file 当前文章文件。
 * @param knownSlugs 全站 slug 集合。
 * @returns 当前文章的问题列表。
 */
function checkFile(file: ContentFile, knownSlugs: Set<string>): CheckIssue[] {
  const issues: CheckIssue[] = []
  const raw = fs.readFileSync(file.absolutePath, "utf-8")
  const { data, content } = matter(raw)
  const headings = extractH2Headings(content)

  for (const field of requiredFrontmatterFields) {
    if (!(field in data)) {
      issues.push({ file: file.relativePath, message: `缺少 frontmatter 字段：${field}` })
    }
  }

  if (!allowedStatuses.has(data.status)) {
    issues.push({ file: file.relativePath, message: `status 不合法：${data.status || "空"}` })
  }

  if (!allowedDifficulties.has(data.difficulty)) {
    issues.push({ file: file.relativePath, message: `difficulty 不合法：${data.difficulty || "空"}` })
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    issues.push({ file: file.relativePath, message: "tags 必须是非空数组" })
  }

  if (!Array.isArray(data.keywords) || data.keywords.length === 0) {
    issues.push({ file: file.relativePath, message: "keywords 必须是非空数组" })
  }

  if (typeof data.summary !== "string" || data.summary.trim().length < 20) {
    issues.push({ file: file.relativePath, message: "summary 至少需要 20 个字符" })
  }

  if (!Array.isArray(data.learningGoals) || data.learningGoals.length < 3) {
    issues.push({ file: file.relativePath, message: "learningGoals 至少需要 3 条" })
  }

  for (const field of ["prerequisites", "related", "crossRefs"]) {
    if (!isDocReferenceArray(data[field])) {
      issues.push({ file: file.relativePath, message: `${field} 必须是 title/slug 引用数组` })
    }
  }

  if (!isExternalReferenceArray(data.references)) {
    issues.push({ file: file.relativePath, message: "references 必须是非空 title/url 参考资料数组" })
  }

  for (const heading of requiredHeadings) {
    if (!headings.includes(heading)) {
      issues.push({ file: file.relativePath, message: `缺少二级标题：${heading}` })
    }
  }

  if ((content.match(/```/g) || []).length < 2) {
    issues.push({ file: file.relativePath, message: "正文至少需要 1 个代码块" })
  }

  if (!/<Quiz\b/.test(content)) {
    issues.push({ file: file.relativePath, message: "正文至少需要 1 个 Quiz 组件" })
  }

  if (!/^##\s+参考资料/m.test(content)) {
    issues.push({ file: file.relativePath, message: "正文必须包含 ## 参考资料" })
  }

  if (/内容待补充|TODO|TBD/.test(content)) {
    issues.push({ file: file.relativePath, message: "正文存在模板残留或待办标记" })
  }

  issues.push(...validateReferenceSlugs("prerequisites", data.prerequisites, knownSlugs, file.relativePath))
  issues.push(...validateReferenceSlugs("related", data.related, knownSlugs, file.relativePath))
  issues.push(...validateReferenceSlugs("crossRefs", data.crossRefs, knownSlugs, file.relativePath))

  return issues
}

if (!fs.existsSync(contentDirectory)) {
  console.error("content 目录不存在")
  process.exit(1)
}

const files = collectMdxFiles(contentDirectory)
const knownSlugs = new Set(files.map((file) => file.slug))
const issues = files.flatMap((file) => checkFile(file, knownSlugs))

if (issues.length > 0) {
  console.error(`内容结构检查失败：${issues.length} 个问题`)
  for (const issue of issues.slice(0, 120)) {
    console.error(`- ${issue.file}: ${issue.message}`)
  }
  if (issues.length > 120) {
    console.error(`...另有 ${issues.length - 120} 个问题未展示`)
  }
  process.exit(1)
}

console.log(`内容结构检查通过：${files.length} 篇文章符合 V2 标准`)
