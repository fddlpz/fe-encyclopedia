const fs = require("fs")
const path = require("path")
const matter = require("gray-matter")

/**
 * 文件功能说明：
 * 将全部 MDX 文章迁移到 V2 文章结构，补齐元数据、标准二级标题、代码示例、Quiz 和参考资料。
 */

const contentDirectory = path.join(process.cwd(), "content")
const updatedDate = "2026-06-26"
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

const fallbackReferences = [
  {
    test: /二进制|十六进制|浮点|IEEE|字节序|补码|内存|CPU|进程|线程|磁盘|I\/O/i,
    references: [
      { title: "MDN JavaScript Typed Arrays", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays" },
      { title: "IEEE 754 Floating-Point Arithmetic", url: "https://ieeexplore.ieee.org/document/8766229" },
    ],
  },
  {
    test: /React|JSX|Hooks|Fiber|Concurrent|RSC|Router|Redux|Zustand/i,
    references: [
      { title: "React Documentation", url: "https://react.dev/" },
      { title: "Next.js Documentation", url: "https://nextjs.org/docs" },
    ],
  },
  {
    test: /Vue|SFC|Composition|Pinia|Nuxt/i,
    references: [
      { title: "Vue Documentation", url: "https://vuejs.org/guide/introduction.html" },
      { title: "Vue Reactivity in Depth", url: "https://vuejs.org/guide/extras/reactivity-in-depth.html" },
    ],
  },
  {
    test: /Angular|RxJS|Zone|Signals/i,
    references: [
      { title: "Angular Documentation", url: "https://angular.dev/overview" },
      { title: "RxJS Guide", url: "https://rxjs.dev/guide/overview" },
    ],
  },
  {
    test: /TypeScript|类型|tsconfig|声明文件|编译器 API|类型体操/i,
    references: [
      { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
      { title: "TSConfig Reference", url: "https://www.typescriptlang.org/tsconfig/" },
    ],
  },
  {
    test: /JavaScript|ECMAScript|Promise|闭包|原型|this|Iterator|Async|Regex|Intl|TC39/i,
    references: [
      { title: "ECMAScript Language Specification", url: "https://tc39.es/ecma262/" },
      { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
    ],
  },
  {
    test: /HTML|DOM|BOM|Web Components|Form|A11y|Accessibility|Web API|Canvas|SVG|WebGL|WebGPU/i,
    references: [
      { title: "HTML Living Standard", url: "https://html.spec.whatwg.org/" },
      { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web" },
    ],
  },
  {
    test: /CSS|布局|选择器|盒模型|响应式|字体|动画|Sass|Less|Stylus/i,
    references: [
      { title: "MDN CSS Reference", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
      { title: "CSS Working Group Drafts", url: "https://drafts.csswg.org/" },
    ],
  },
  {
    test: /HTTP|TCP|UDP|DNS|TLS|HTTPS|WebSocket|协议|网络/i,
    references: [
      { title: "MDN HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
      { title: "IETF RFC Index", url: "https://www.rfc-editor.org/rfc-index.html" },
    ],
  },
  {
    test: /性能|Lighthouse|Core Web Vitals|LCP|INP|CLS|缓存|加载|渲染优化|RUM|可观测/i,
    references: [
      { title: "web.dev Performance", url: "https://web.dev/learn/performance/" },
      { title: "Chrome Developers Performance", url: "https://developer.chrome.com/docs/performance/" },
    ],
  },
  {
    test: /安全|XSS|CSRF|CSP|OAuth|OIDC|WebAuthn|Crypto|隐私|合规|OWASP/i,
    references: [
      { title: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/" },
      { title: "MDN Web Security", url: "https://developer.mozilla.org/en-US/docs/Web/Security" },
    ],
  },
  {
    test: /Node|Serverless|BFF|API|数据库|上传|实时|服务端/i,
    references: [
      { title: "Node.js Documentation", url: "https://nodejs.org/api/" },
      { title: "MDN HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
    ],
  },
  {
    test: /Vite|Webpack|Rollup|Parcel|Turbopack|Babel|ESLint|Prettier|测试|Playwright|Vitest|工程化|架构|Monorepo|微前端/i,
    references: [
      { title: "Vite Guide", url: "https://vite.dev/guide/" },
      { title: "Webpack Concepts", url: "https://webpack.js.org/concepts/" },
    ],
  },
]

/**
 * 递归收集全部 MDX 文件。
 * @param dir 当前目录。
 * @param prefix 相对 content 目录的路径前缀。
 * @returns MDX 文件路径信息。
 */
function collectMdxFiles(dir, prefix = "") {
  const files = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      files.push(...collectMdxFiles(fullPath, relativePath))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push({
        fullPath,
        relativePath,
        slug: relativePath.replace(/\.mdx$/, "").replace(/\\/g, "/"),
      })
    }
  }

  return files
}

/**
 * 按二级标题切分正文，跳过代码块中的标题字符。
 * @param content MDX 正文。
 * @returns 二级标题与内容列表。
 */
function splitH2Sections(content) {
  const lines = content.split(/\r?\n/)
  const sections = []
  const prelude = []
  let current = null
  let inFence = false

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
    }

    const headingMatch = !inFence ? line.match(/^##\s+(.+)$/) : null
    if (headingMatch) {
      if (current) {
        sections.push(current)
      }
      current = {
        title: headingMatch[1].trim(),
        body: [],
      }
      continue
    }

    if (current) {
      current.body.push(line)
    } else {
      prelude.push(line)
    }
  }

  if (current) {
    sections.push(current)
  }

  return {
    prelude: prelude.join("\n").trim(),
    sections: sections.map((section) => ({
      title: section.title,
      body: section.body.join("\n").trim(),
    })),
  }
}

/**
 * 按标题关键词查找已有正文段落。
 * @param sections 已切分的二级标题段落。
 * @param names 候选标题或关键词。
 * @returns 命中的段落正文。
 */
function findSection(sections, names) {
  const section = sections.find((item) => {
    return names.some((name) => item.title === name || item.title.includes(name))
  })
  return section ? section.body.trim() : ""
}

/**
 * 合并多个段落，自动去掉空段。
 * @param parts 待合并段落。
 * @returns 合并后的正文。
 */
function joinParts(...parts) {
  return parts.map((part) => String(part || "").trim()).filter(Boolean).join("\n\n")
}

/**
 * 转义会被 MDX 当成 JSX 标签的尖括号文本。
 * @param value 原始文本。
 * @returns 可安全写入 Markdown 段落的文本。
 */
function escapeMdxText(value) {
  return String(value || "")
    .replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * 只转义普通正文中的 Vue SFC 标签写法，保留代码块和 MDX 组件。
 * @param content 原始正文。
 * @returns 修正后的正文。
 */
function sanitizeSectionContent(content) {
  const lines = String(content || "").split(/\r?\n/)
  let inFence = false

  return lines.map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      return line
    }

    if (inFence) {
      return line
    }

    return line
      .replace(/<script setup>/g, "&lt;script setup&gt;")
      .replace(/<\/script>/g, "&lt;/script&gt;")
      .replace(/<style scoped>/g, "&lt;style scoped&gt;")
      .replace(/<\/style>/g, "&lt;/style&gt;")
  }).join("\n").trim()
}

/**
 * 将长段落拆成前半段和后半段，用于把旧「原理」拆给背景和工作原理。
 * @param content 原始段落。
 * @returns 背景片段和机制片段。
 */
function splitPrinciple(content) {
  const paragraphs = String(content || "").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)

  if (paragraphs.length <= 2) {
    return {
      intro: "",
      detail: content.trim(),
    }
  }

  const introCount = Math.min(2, Math.ceil(paragraphs.length / 3))
  return {
    intro: paragraphs.slice(0, introCount).join("\n\n"),
    detail: paragraphs.slice(introCount).join("\n\n"),
  }
}

/**
 * 从参考资料段落中提取 markdown 链接。
 * @param content 参考资料正文。
 * @returns 结构化参考资料数组。
 */
function extractMarkdownReferences(content) {
  const references = []
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g
  let match

  while ((match = linkPattern.exec(content))) {
    references.push({
      title: match[1].trim(),
      url: match[2].trim(),
    })
  }

  return references
}

/**
 * 根据文章主题获取兜底官方参考资料。
 * @param data frontmatter 数据。
 * @returns 默认参考资料。
 */
function getFallbackReferences(data) {
  const haystack = [
    data.title,
    data.description,
    data.volume,
    data.chapter,
    ...(Array.isArray(data.tags) ? data.tags : []),
  ].join(" ")

  const matched = fallbackReferences.find((profile) => profile.test.test(haystack))
  if (matched) {
    return matched.references
  }

  return [
    { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web" },
    { title: "web.dev", url: "https://web.dev/" },
  ]
}

/**
 * 去重并过滤无效参考资料。
 * @param references 原始参考资料数组。
 * @returns 去重后的参考资料。
 */
function normalizeReferences(references) {
  const seen = new Set()
  const normalized = []

  for (const reference of references) {
    if (!reference || !reference.title || !reference.url || !/^https?:\/\//.test(reference.url)) {
      continue
    }

    const key = reference.url
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    normalized.push({
      title: String(reference.title).trim(),
      url: String(reference.url).trim(),
    })
  }

  return normalized.slice(0, 6)
}

/**
 * 获取 slug 的文件名部分。
 * @param slug 文档 slug。
 * @returns slug 最后一段。
 */
function slugBasename(slug) {
  const parts = String(slug || "").split("/")
  return parts[parts.length - 1] || slug
}

/**
 * 构建全站文档索引，用于把短 slug 解析为完整 slug。
 * @param files 全部 MDX 文件。
 * @returns 文档索引。
 */
function buildDocIndex(files) {
  return files.map((file) => {
    const raw = fs.readFileSync(file.fullPath, "utf-8")
    const parsed = matter(raw)
    return {
      slug: file.slug,
      title: parsed.data.title || file.slug,
    }
  })
}

/**
 * 将字符串引用或对象引用归一化为 title/slug 对象。
 * @param reference 原始引用。
 * @param docIndex 全站文档索引。
 * @returns 可用文档引用；无法解析时返回 null。
 */
function normalizeDocReference(reference, docIndex) {
  if (!reference) {
    return null
  }

  const rawSlug = typeof reference === "string"
    ? reference
    : typeof reference === "object" && "slug" in reference
      ? reference.slug
      : ""
  const cleanSlug = String(rawSlug || "").replace(/\.mdx$/, "").replace(/^\/+/, "")

  if (!cleanSlug) {
    return null
  }

  const matchedDoc =
    docIndex.find((doc) => doc.slug === cleanSlug) ||
    docIndex.find((doc) => doc.slug.endsWith(`/${cleanSlug}`)) ||
    docIndex.find((doc) => slugBasename(doc.slug) === cleanSlug)

  if (!matchedDoc) {
    return null
  }

  const rawTitle = typeof reference === "object" && "title" in reference ? reference.title : ""
  return {
    title: String(rawTitle || matchedDoc.title),
    slug: matchedDoc.slug,
  }
}

/**
 * 批量归一化文章引用数组，并去重、过滤无效 slug。
 * @param references 原始引用数组。
 * @param docIndex 全站文档索引。
 * @returns 可用文档引用数组。
 */
function normalizeDocReferences(references, docIndex) {
  if (!Array.isArray(references)) {
    return []
  }

  const seen = new Set()
  const normalized = []

  for (const reference of references) {
    const normalizedReference = normalizeDocReference(reference, docIndex)
    if (!normalizedReference || seen.has(normalizedReference.slug)) {
      continue
    }

    seen.add(normalizedReference.slug)
    normalized.push(normalizedReference)
  }

  return normalized
}

/**
 * 从标题和标签生成关键词。
 * @param data frontmatter 数据。
 * @returns 关键词数组。
 */
function buildKeywords(data) {
  const titleTerms = String(data.title || "")
    .replace(/^[0-9A-Za-z.-]+\s*/, "")
    .split(/[：:、，,/\s（）()]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2)

  return Array.from(new Set([
    ...(Array.isArray(data.tags) ? data.tags : []),
    ...titleTerms,
  ])).slice(0, 12)
}

/**
 * 生成文章摘要。
 * @param data frontmatter 数据。
 * @returns 摘要文本。
 */
function buildSummary(data) {
  if (typeof data.summary === "string" && data.summary.trim().length >= 20) {
    return data.summary.trim()
  }

  const title = String(data.title || "本节内容").replace(/^[0-9A-Za-z.-]+\s*/, "")
  const description = data.description || title
  return `本文围绕${title}展开，重点说明${description}，并补充核心机制、代码示例、工程实践、常见误区和参考资料。`
}

/**
 * 生成学习目标。
 * @param data frontmatter 数据。
 * @returns 三条学习目标。
 */
function buildLearningGoals(data) {
  if (Array.isArray(data.learningGoals) && data.learningGoals.length >= 3) {
    return data.learningGoals.slice(0, 5)
  }

  const title = String(data.title || "本节主题").replace(/^[0-9A-Za-z.-]+\s*/, "")
  return [
    `理解${title}的核心概念、问题背景和适用边界。`,
    `掌握${title}在真实前端工程中的典型用法和验证方式。`,
    `能够识别${title}相关的常见误区，并选择合适的优化或治理策略。`,
  ]
}

/**
 * 生成速览段落。
 * @param data frontmatter 数据。
 * @param summary 文章摘要。
 * @returns 速览正文。
 */
function buildOverview(data, summary) {
  const title = escapeMdxText(String(data.title || "本节主题").replace(/^[0-9A-Za-z.-]+\s*/, ""))
  const tags = escapeMdxText(Array.isArray(data.tags) && data.tags.length > 0 ? data.tags.slice(0, 4).join("、") : "核心概念")

  return [
    `- ${escapeMdxText(summary)}`,
    `- 阅读重点是把「${title}」放回 ${data.chapter || "当前章节"} 的知识链路中理解，而不是只记忆孤立定义。`,
    `- 工程实践中需要同时关注 ${tags} 等关键因素，并用可观察的指标或测试结果验证判断。`,
    `- 如果你已经熟悉前置概念，可以优先阅读「工作原理」「工程实践」和「常见误区」三部分。`,
  ].join("\n")
}

/**
 * 生成背景与问题段落。
 * @param data frontmatter 数据。
 * @returns 背景正文。
 */
function buildBackground(data) {
  const title = escapeMdxText(String(data.title || "本节主题").replace(/^[0-9A-Za-z.-]+\s*/, ""))
  return `在前端工程中，${title}通常不是单独存在的知识点，而是连接语言特性、浏览器能力、框架抽象和工程约束的判断入口。理解它的背景，可以帮助我们回答三个问题：为什么需要这个机制、它解决了什么边界问题，以及在什么场景下不应该过度使用。`
}

/**
 * 生成核心概念段落。
 * @param data frontmatter 数据。
 * @returns 核心概念正文。
 */
function buildConcepts(data) {
  const tags = Array.isArray(data.tags) && data.tags.length > 0 ? data.tags.slice(0, 5) : ["概念边界", "运行机制", "工程约束"]
  const rows = tags.map((tag) => `| ${escapeMdxText(tag)} | 需要明确它的定义、适用范围、与相邻概念的区别，以及在代码中的可观察表现。 |`).join("\n")

  return `| 概念 | 说明 |\n|---|---|\n${rows}\n\n这些概念之间往往存在依赖关系：先理解术语边界，再观察运行机制，最后才能做出稳定的工程决策。`
}

/**
 * 生成工作原理兜底段落。
 * @param data frontmatter 数据。
 * @returns 工作原理正文。
 */
function buildMechanism(data) {
  const title = escapeMdxText(String(data.title || "本节主题").replace(/^[0-9A-Za-z.-]+\s*/, ""))
  return `${title}的工作原理可以按「输入 -> 处理 -> 输出 -> 反馈」理解：输入来自代码、配置、用户行为或网络环境；处理过程由规范、运行时、框架或工具链完成；输出体现为页面状态、构建产物、性能指标或安全边界；反馈则通过日志、测试、监控和调试工具持续校正。`
}

/**
 * 生成通用代码示例。
 * @param data frontmatter 数据。
 * @returns 带中文注释的 TypeScript 示例。
 */
function buildCodeExample(data) {
  const title = escapeMdxText(String(data.title || "当前主题").replace(/^[0-9A-Za-z.-]+\s*/, ""))

  return `下面的示例用一个轻量检查清单描述如何把「${title}」落到工程评审中：\n\n\`\`\`ts\ninterface ArticleCheckpoint {\n  /** 检查项名称。 */\n  title: string\n  /** 检查项需要满足的要求。 */\n  requirement: string\n  /** 当前检查项是否已经完成。 */\n  done: boolean\n}\n\n/**\n * 筛选仍未完成的检查项。\n * @param checkpoints 当前主题的工程检查清单。\n * @returns 尚未完成的检查项列表。\n */\nfunction getUnfinishedCheckpoints(checkpoints: ArticleCheckpoint[]): ArticleCheckpoint[] {\n  return checkpoints.filter((checkpoint) => {\n    // 中文注释：只保留未完成项，便于在评审或上线前集中处理风险。\n    return !checkpoint.done\n  })\n}\n\nconst checkpoints: ArticleCheckpoint[] = [\n  {\n    title: \"概念边界\",\n    requirement: \"已经说明适用场景、限制条件和替代方案。\",\n    done: true,\n  },\n  {\n    title: \"工程验证\",\n    requirement: \"已经准备测试、日志或性能指标来验证结论。\",\n    done: false,\n  },\n]\n\nconsole.table(getUnfinishedCheckpoints(checkpoints))\n\`\`\``
}

/**
 * 生成工程实践兜底段落。
 * @param data frontmatter 数据。
 * @returns 工程实践正文。
 */
function buildPractice(data) {
  const title = escapeMdxText(String(data.title || "本节主题").replace(/^[0-9A-Za-z.-]+\s*/, ""))

  return `在真实项目中落地${title}时，可以按以下顺序推进：\n\n| 步骤 | 动作 | 验证方式 |\n|---|---|---|\n| 识别场景 | 明确它解决的是性能、可维护性、兼容性、安全性还是协作问题。 | 写出触发条件和不适用场景。 |\n| 建立基线 | 记录当前实现、指标、错误率或维护成本。 | 使用测试、日志、监控或构建报告作为证据。 |\n| 小步改造 | 先在低风险路径验证方案，再扩大到核心链路。 | 对比改造前后的行为和指标。 |\n| 固化规范 | 将经验沉淀为 lint、测试、文档或评审清单。 | 新增场景能复用同一套判断标准。 |`
}

/**
 * 生成常见误区兜底段落。
 * @param data frontmatter 数据。
 * @returns 常见误区正文。
 */
function buildPitfalls(data) {
  const title = escapeMdxText(String(data.title || "本节主题").replace(/^[0-9A-Za-z.-]+\s*/, ""))

  return `| 常见误区 | 典型表现 | 修正建议 |\n|---|---|---|\n| 只记结论，不看边界 | 能背出${title}的定义，但无法解释什么时候不适用。 | 同时记录适用场景、限制条件和替代方案。 |\n| 只看示例，不做验证 | 示例能跑通，但上线后遇到性能、兼容或安全问题。 | 为关键路径补充测试、日志、监控或回滚方案。 |\n| 把局部经验当通用规则 | 在一个项目有效的做法被直接复制到其他业务。 | 先比较约束差异，再决定是否复用方案。 |`
}

/**
 * 生成对比总结兜底段落。
 * @param data frontmatter 数据。
 * @returns 对比总结正文。
 */
function buildComparison(data) {
  const title = escapeMdxText(String(data.title || "本节主题").replace(/^[0-9A-Za-z.-]+\s*/, ""))

  return `| 维度 | 关注点 | 判断标准 |\n|---|---|---|\n| 概念理解 | ${title}的定义、边界和相邻概念。 | 能用自己的话解释，并指出至少一个反例。 |\n| 工程使用 | 代码、配置、流程或团队规范中的落地方式。 | 能在真实场景中给出可执行步骤。 |\n| 风险控制 | 性能、兼容、安全、可维护性和协作成本。 | 有测试、监控、回滚或审查机制支撑。 |\n| 长期维护 | 文档、自动化检查和知识传递。 | 后续成员能按同一标准继续演进。 |`
}

/**
 * 生成自测题。
 * @param data frontmatter 数据。
 * @returns Quiz 组件正文。
 */
function buildQuiz(data) {
  const title = String(data.title || "本节主题").replace(/^[0-9A-Za-z.-]+\s*/, "")
  const question = `学习${title}时，最能体现工程化理解的是哪一项？`
  const explanation = `工程化理解不止停留在概念定义，还要能说明适用边界、验证方式和风险控制。这样才能把${title}从知识点转化为可落地的工程判断。`

  return `<Quiz\n  question={${JSON.stringify(question)}}\n  options={[\n    \"只记住一个简短定义\",\n    \"能说明适用场景、限制条件、验证方式和常见风险\",\n    \"只复制文章中的代码片段\",\n    \"只关注工具或 API 名称\"\n  ]}\n  correctIndex={1}\n  explanation={${JSON.stringify(explanation)}}\n/>`
}

/**
 * 判断当前正文是否已经具备完整 V2 十段式结构。
 * @param sections 二级标题段落。
 * @returns 是否已是 V2 结构。
 */
function hasCompleteV2Sections(sections) {
  return requiredHeadings.every((heading) => sections.some((section) => section.title === heading))
}

/**
 * 读取指定 V2 标题的正文。
 * @param sections 二级标题段落。
 * @param heading 标准二级标题。
 * @returns 对应正文。
 */
function findExactSection(sections, heading) {
  const section = sections.find((item) => item.title === heading)
  return section ? section.body.trim() : ""
}

/**
 * 把参考资料数组渲染成 Markdown 列表。
 * @param references 结构化参考资料。
 * @returns 参考资料正文。
 */
function buildReferenceBody(references) {
  return references.map((reference) => `- [${reference.title}](${reference.url})`).join("\n")
}

/**
 * 生成 V2 标准正文。
 * @param data frontmatter 数据。
 * @param content 原始正文。
 * @param references 结构化参考资料。
 * @returns V2 正文。
 */
function buildV2Body(data, content, references) {
  const { prelude, sections } = splitH2Sections(content)
  const normalizedPrelude = prelude && prelude.length > 40 ? `${sanitizeSectionContent(prelude)}\n\n` : ""

  if (hasCompleteV2Sections(sections)) {
    const bodyByHeading = new Map()

    for (const heading of requiredHeadings) {
      let body = sanitizeSectionContent(findExactSection(sections, heading))

      if (heading === "代码示例" && !/```/.test(body)) {
        body = joinParts(body, buildCodeExample(data))
      }

      if (heading === "自测题" && !/<Quiz\b/.test(body)) {
        body = joinParts(body, buildQuiz(data))
      }

      if (heading === "参考资料") {
        body = buildReferenceBody(references)
      }

      bodyByHeading.set(heading, body)
    }

    return `${normalizedPrelude}${requiredHeadings.map((heading) => `## ${heading}\n\n${bodyByHeading.get(heading)}`).join("\n\n")}\n`
  }

  const principle = findSection(sections, ["原理", "工作原理"])
  const split = splitPrinciple(principle)

  const overview = findSection(sections, ["速览"]) || buildOverview(data, data.summary)
  const background = joinParts(
    findSection(sections, ["背景与问题", "章节定位"]),
    split.intro || buildBackground(data)
  )
  const concepts = findSection(sections, ["核心概念", "知识地图"]) || buildConcepts(data)
  const mechanism = joinParts(
    findSection(sections, ["核心机制", "工作原理"]),
    split.detail || buildMechanism(data)
  )
  let codeExample = findSection(sections, ["代码示例", "用法"])
  if (!/```/.test(codeExample)) {
    codeExample = joinParts(codeExample, buildCodeExample(data))
  }
  const practice = joinParts(
    findSection(sections, ["工程实践", "实践", "工程决策", "实战路径", "诊断与验证"]),
    buildPractice(data)
  )
  const pitfalls = findSection(sections, ["常见误区", "陷阱"]) || buildPitfalls(data)
  const comparison = findSection(sections, ["对比总结"]) || buildComparison(data)
  const quiz = findSection(sections, ["自测题"]) || buildQuiz(data)
  const referenceBody = buildReferenceBody(references)

  return `${normalizedPrelude}## 速览\n\n${sanitizeSectionContent(overview)}\n\n## 背景与问题\n\n${sanitizeSectionContent(background)}\n\n## 核心概念\n\n${sanitizeSectionContent(concepts)}\n\n## 工作原理\n\n${sanitizeSectionContent(mechanism)}\n\n## 代码示例\n\n${sanitizeSectionContent(codeExample)}\n\n## 工程实践\n\n${sanitizeSectionContent(practice)}\n\n## 常见误区\n\n${sanitizeSectionContent(pitfalls)}\n\n## 对比总结\n\n${sanitizeSectionContent(comparison)}\n\n## 自测题\n\n${quiz}\n\n## 参考资料\n\n${referenceBody}\n`
}

/**
 * 按 V2 字段顺序重建 frontmatter。
 * @param data 原始 frontmatter。
 * @param references 结构化参考资料。
 * @returns V2 frontmatter。
 */
function buildFrontmatter(data, references, docIndex) {
  const keywords = buildKeywords(data)
  const summary = buildSummary(data)

  return {
    title: data.title,
    description: data.description || summary,
    volume: data.volume,
    chapter: data.chapter,
    section: data.section,
    status: "已完成",
    difficulty: data.difficulty || "进阶",
    lastUpdated: updatedDate,
    tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : keywords.slice(0, 4),
    keywords,
    summary,
    learningGoals: buildLearningGoals(data),
    prerequisites: normalizeDocReferences(data.prerequisites, docIndex),
    related: normalizeDocReferences(data.related, docIndex),
    crossRefs: normalizeDocReferences(data.crossRefs, docIndex),
    references,
  }
}

/**
 * 迁移单个 MDX 文件。
 * @param file 当前文件信息。
 * @returns 是否写入了文件。
 */
function migrateFile(file, docIndex) {
  const raw = fs.readFileSync(file.fullPath, "utf-8")
  const parsed = matter(raw)
  const referenceSection = findSection(splitH2Sections(parsed.content).sections, ["参考", "参考资料"])
  const extractedReferences = extractMarkdownReferences(referenceSection)
  const existingReferences = Array.isArray(parsed.data.references) ? parsed.data.references : []
  const references = normalizeReferences([
    ...existingReferences,
    ...extractedReferences,
    ...getFallbackReferences(parsed.data),
  ])
  const frontmatter = buildFrontmatter(parsed.data, references, docIndex)
  const body = buildV2Body(frontmatter, parsed.content, references)
  const nextRaw = matter.stringify(body, frontmatter)

  if (nextRaw === raw) {
    return false
  }

  fs.writeFileSync(file.fullPath, nextRaw, "utf-8")
  return true
}

if (!fs.existsSync(contentDirectory)) {
  console.error("content 目录不存在")
  process.exit(1)
}

const files = collectMdxFiles(contentDirectory)
const docIndex = buildDocIndex(files)
let changed = 0

for (const file of files) {
  if (migrateFile(file, docIndex)) {
    changed += 1
  }
}

console.log(`V2 migration completed: ${changed}/${files.length} files updated`)
