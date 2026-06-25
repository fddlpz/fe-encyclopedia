/**
 * 文件功能说明：
 * 批量补齐 content 目录中仍为「内容待补充...」的 MDX 文章。
 * 脚本会读取每篇文章的 frontmatter，根据卷、章、标题、描述和标签生成稳定的四段式正文，
 * 并补充状态、更新时间以及相邻章节关系，便于后续持续维护。
 */

const fs = require("fs")
const path = require("path")

/** 内容根目录：所有 MDX 文章按卷/章/节存放。 */
const contentDirectory = path.join(process.cwd(), "content")

/** 本轮内容补充日期：用于写入 frontmatter 和优化计划记录。 */
const updatedDate = "2026-06-24"

/** 标准正文段落：与站点当前文章结构保持一致。 */
const sectionNames = ["原理", "用法", "实践", "陷阱"]

/**
 * 读取目录项并按自然数字顺序排序。
 * @param {string} directory 需要读取的目录绝对路径。
 * @returns {fs.Dirent[]} 排序后的目录项列表。
 */
function sortedEntries(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}

/**
 * 将 Markdown 文本中的尖括号转义，避免 MDX 将技术术语误判为 JSX/HTML。
 * @param {string} value 原始文本。
 * @returns {string} 可安全写入 MDX 正文的文本。
 */
function escapeMarkdownText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * 解析简单 frontmatter，并保留原始 frontmatter 文本。
 * @param {string} raw 文件原始内容。
 * @returns {{frontmatterText: string, body: string, data: Record<string, string>, lines: string[]}}
 */
function parseDocument(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) {
    return { frontmatterText: "", body: raw, data: {}, lines: [] }
  }

  const frontmatterText = match[1]
  const body = raw.slice(match[0].length)
  const lines = frontmatterText.split(/\r?\n/)
  const data = {}

  for (const line of lines) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!item) continue
    data[item[1]] = item[2].replace(/^["']|["']$/g, "").trim()
  }

  return { frontmatterText, body, data, lines }
}

/**
 * 从 frontmatter 的 tags 行解析标签数组。
 * @param {string} tagLine frontmatter 中的 tags 原始值。
 * @returns {string[]} 标签列表。
 */
function parseTags(tagLine) {
  const raw = String(tagLine || "").trim()
  if (!raw.startsWith("[")) return []

  try {
    return JSON.parse(raw.replace(/'/g, '"'))
  } catch {
    return raw
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
  }
}

/**
 * 将标题中的章节编号去掉，保留真正的主题名称。
 * @param {string} title frontmatter 中的完整标题。
 * @returns {string} 去编号后的主题标题。
 */
function topicName(title) {
  return String(title || "")
    .replace(/^\s*[\da-zA-Z]+(?:\.\d+)?\s+/, "")
    .trim()
}

/**
 * 从描述中提取关键术语，供正文生成时使用。
 * @param {string} description frontmatter 描述。
 * @param {string[]} tags frontmatter 标签。
 * @returns {string[]} 去重后的关键术语。
 */
function extractTerms(description, tags) {
  const stopWords = new Set(["vs", "VS", "等", "与", "和", "及", "的", "API"])
  const fromDescription = String(description || "")
    .split(/[、，,：:；;\/（）()→\s]+/g)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 28)
    .filter((item) => !stopWords.has(item))

  return Array.from(new Set([...fromDescription, ...tags])).slice(0, 8)
}

/**
 * 根据章节路径返回内容画像，控制不同主题的表达重点。
 * @param {string} chapterSlug 例如 volume-02/chapter-05。
 * @param {string} title 文章标题。
 * @returns {{domain: string, principle: string, usage: string, practice: string, pitfalls: string[], difficulty?: string}}
 */
function profileFor(chapterSlug, title) {
  if (chapterSlug.includes("chapter-02")) {
    return {
      domain: "浏览器网络栈、传输协议、缓存和安全边界",
      principle: "先理解分层职责，再看数据如何从应用层一路映射到传输层、网络层和链路层。前端无法直接操作所有底层协议，但页面加载、接口请求、实时通信和证书校验都建立在这些协议之上。",
      usage: "结合浏览器 DevTools、服务端日志、抓包工具和协议文档验证链路，不把请求耗时简单归因到单一环节。",
      practice: "在接口慢、连接不稳定或跨地域访问的场景中，优先拆分 DNS、连接建立、TLS、首字节和下载阶段，再决定是改协议、改缓存还是改服务端。",
      pitfalls: ["只看 HTTP 状态码而忽略连接阶段耗时", "把 TCP、TLS、HTTP 的职责混在一起", "在浏览器端假设可以直接控制底层套接字"],
      difficulty: "基础",
    }
  }

  if (chapterSlug.includes("chapter-03")) {
    return {
      domain: "浏览器安全模型、隔离策略和安全响应头",
      principle: "浏览器安全不是单个 API，而是一组默认隔离规则和显式授权机制。理解威胁模型后，才能判断限制来自同源策略、内容策略、传输安全还是权限边界。",
      usage: "先明确资产、入口和信任边界，再通过响应头、服务端校验和最小权限策略组合防护。",
      practice: "在登录、支付、后台管理和嵌入式页面中，把安全策略纳入上线检查清单，而不是等漏洞出现后补丁式修复。",
      pitfalls: ["只在前端做校验而缺少服务端约束", "为了兼容临时放宽安全头", "没有区分开发环境和生产环境策略"],
      difficulty: "基础",
    }
  }

  if (chapterSlug.includes("chapter-04")) {
    return {
      domain: "HTML 语义、用户代理默认能力和可访问性基础",
      principle: "HTML 的价值不只是承载 DOM 节点，它还向浏览器、搜索引擎、辅助技术和表单系统表达结构与意图。语义正确通常比额外脚本更可靠。",
      usage: "优先使用原生元素和属性，在需要自定义交互时保留键盘、焦点、表单和可访问性语义。",
      practice: "搭建页面结构时，先确定内容层级、交互角色和设备适配，再决定是否需要自定义组件。",
      pitfalls: ["用 div 模拟所有控件", "忽略 lang、charset、viewport 等基础元数据", "只在视觉上还原设计而忽略辅助技术"],
      difficulty: "基础",
    }
  }

  if (chapterSlug.includes("chapter-05")) {
    return {
      domain: "CSS 层叠、布局、视觉渲染和样式工程化",
      principle: "CSS 是声明式约束系统，浏览器会根据选择器、层叠、继承、格式化上下文和渲染管线计算最终样式。理解约束关系比记忆属性更重要。",
      usage: "从布局模型、尺寸约束、状态样式和响应式规则入手，减少互相覆盖的样式和不可预测的副作用。",
      practice: "在组件化项目中，将布局、主题、状态和工具类边界拆清楚，并用约定减少全局样式污染。",
      pitfalls: ["滥用 !important 掩盖层叠问题", "不了解包含块和层叠上下文导致定位异常", "只按桌面视口设计而忽略容器变化"],
      difficulty: "基础",
    }
  }

  if (chapterSlug.includes("chapter-07")) {
    return {
      domain: "TypeScript 类型系统、编译期约束和大型项目协作",
      principle: "TypeScript 在运行前建立类型约束，帮助团队把数据契约、模块边界和不可达状态显式化。类型越贴近业务不变量，越能减少后续维护成本。",
      usage: "从 strict 配置开始，用类型推断保持简洁，只在边界层、公共 API 和复杂状态处补充显式类型。",
      practice: "在接口响应、表单模型、状态机和组件 props 中建立类型边界，并通过工具类型复用稳定结构。",
      pitfalls: ["把 any 当作快速通道长期保留", "用复杂类型炫技而牺牲可读性", "以为类型检查可以替代运行时校验"],
      difficulty: title.includes("高级") || title.includes("编译器") || title.includes("类型体操") ? "高级" : "进阶",
    }
  }

  if (chapterSlug.includes("chapter-08")) {
    return {
      domain: "浏览器多进程架构、渲染管线和 GPU 合成",
      principle: "现代浏览器通过多进程隔离、主线程调度、合成线程和 GPU 管线协作完成页面展示。页面性能问题通常来自这些阶段之间的阻塞和回退。",
      usage: "用 Performance 面板观察解析、样式、布局、绘制和合成阶段，避免仅凭肉眼判断卡顿来源。",
      practice: "处理首屏慢、滚动卡顿或内存膨胀时，应把问题定位到导航、资源、脚本、布局、绘制或合成中的具体阶段。",
      pitfalls: ["把所有卡顿都归因于 JavaScript", "忽略跨进程通信和站点隔离影响", "不了解布局和绘制触发条件"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-09")) {
    return {
      domain: "DOM、BOM、浏览器 Web API 和页面生命周期",
      principle: "Web API 是浏览器暴露给页面的能力集合，既包含 DOM 树操作，也包含网络、存储、媒体、性能和权限能力。它们受安全模型、事件循环和页面生命周期共同约束。",
      usage: "优先使用标准 API 和渐进增强策略，明确同步 API、异步 API、权限 API 和可中止操作的边界。",
      practice: "在复杂交互中，把 DOM 更新、事件监听、资源释放和异常处理作为同一条生命周期管理。",
      pitfalls: ["频繁同步读写布局信息", "忘记移除监听器或取消异步任务", "忽略浏览器兼容性和权限拒绝路径"],
      difficulty: "基础",
    }
  }

  if (chapterSlug.includes("chapter-10")) {
    return {
      domain: "JavaScript 引擎、事件循环、内存管理和服务端运行时",
      principle: "运行时决定代码如何被解析、优化、调度和回收。理解引擎与事件循环，可以解释许多看似随机的性能波动和异步顺序问题。",
      usage: "通过性能面板、堆快照、日志时间线和运行时配置验证假设，不依赖单次 benchmark 下结论。",
      practice: "在高频交互、长列表、实时通信和 Node 服务中，把 CPU、内存、I/O 和调度分别观测。",
      pitfalls: ["把微任务当成下一轮事件循环", "忽略 JIT 优化和隐藏类退化", "将浏览器事件循环与 Node.js 阶段完全等同"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-11")) {
    return {
      domain: "React 渲染模型、状态管理、服务端渲染和生态工具",
      principle: "React 以声明式 UI 和组件树为核心，通过 render、reconciliation、commit 和调度机制把状态变化映射到界面。不同生态方案本质上是在管理状态来源、数据获取和渲染时机。",
      usage: "先确认状态归属、渲染边界和副作用位置，再选择 Context、外部状态库、服务端渲染或表单工具。",
      practice: "在中后台、内容站和高交互应用中，按页面数据流拆分服务端状态、客户端状态、表单状态和 URL 状态。",
      pitfalls: ["把所有数据都放进全局状态", "在 render 阶段执行副作用", "忽略 hydration、缓存和并发渲染下的时序差异"],
      difficulty: title.includes("源码") || title.includes("SSR") ? "高级" : "进阶",
    }
  }

  if (chapterSlug.includes("chapter-12")) {
    return {
      domain: "Vue 响应式系统、模板编译、组件渲染和生态工具",
      principle: "Vue 通过响应式依赖收集和模板编译降低手写更新逻辑的成本。理解 ref、reactive、effect、VNode 和编译优化，有助于解释更新时机和性能边界。",
      usage: "将数据建模、组合式逻辑、模板表达和副作用管理拆开，避免在组件里混杂过多职责。",
      practice: "在业务组件中用 Composables 抽离可复用逻辑，用 Pinia 管理跨页面状态，用路由和异步组件控制加载边界。",
      pitfalls: ["解构 reactive 后丢失响应性", "滥用深度 watch", "把 Vue2 和 Vue3 的响应式限制混为一谈"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-13")) {
    return {
      domain: "Angular 依赖注入、模板编译、变更检测和 RxJS 数据流",
      principle: "Angular 是完整应用框架，强调依赖注入、模板约束、编译优化和工程一致性。其复杂度来自框架内建能力多，而不是单个 API 难。",
      usage: "优先理解组件树、注入树、路由边界和 Observable 数据流，再选择 Standalone、表单、CDK 或服务拆分方式。",
      practice: "在大型企业应用中，用模块边界、服务层和响应式数据流管理权限、表单、列表和后台任务。",
      pitfalls: ["不了解 Zone.js 与变更检测关系", "在模板中放复杂计算", "未及时取消订阅或错误处理 Observable"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-14")) {
    return {
      domain: "新兴框架的编译策略、响应式粒度和服务端集成模式",
      principle: "新框架通常围绕减少运行时开销、提高首屏性能或改善开发体验展开。比较框架时应看渲染模型、状态更新粒度、数据获取和部署约束。",
      usage: "不要只看 benchmark，应结合团队经验、生态成熟度、构建链路、部署环境和迁移成本评估。",
      practice: "适合在新项目、局部页面或性能瓶颈明确的场景试点，避免在核心系统中无验证地大规模替换。",
      pitfalls: ["把框架宣传语等同于工程收益", "忽略生态、招聘和长期维护成本", "只比较首屏而不比较交互和数据更新"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-15")) {
    return {
      domain: "包管理、依赖图、编译转换、打包优化和发布流程",
      principle: "前端工具链把源代码、依赖、样式、资源和类型声明转换为浏览器或运行时可消费的产物。核心问题是依赖解析、模块转换、缓存和产物边界。",
      usage: "从项目类型出发选择工具：应用关注开发速度和代码分割，库关注格式兼容、类型声明和副作用标注。",
      practice: "在 CI 中固定包管理器、锁文件和构建缓存，并用 bundle 分析持续监控产物体积。",
      pitfalls: ["混用包管理器导致锁文件漂移", "不了解 ESM/CJS 差异", "把开发服务器速度等同于生产构建质量"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-16")) {
    return {
      domain: "代码规范、静态检查、格式化、类型检查和团队协作流程",
      principle: "质量工具的目标不是制造规则，而是把可自动化的反馈前移，减少评审和线上问题中的重复劳动。",
      usage: "将格式化、lint、类型检查、测试和提交校验分层执行，避免每个工具承担不属于自己的职责。",
      practice: "在团队中把规则写入配置、CI 和模板，重要规则配套解释和自动修复能力。",
      pitfalls: ["规则过严导致开发者绕过工具", "只在本地执行而 CI 不校验", "把风格争论放到代码审查中解决"],
      difficulty: "基础",
    }
  }

  if (chapterSlug.includes("chapter-17")) {
    return {
      domain: "测试金字塔、自动化验证、可维护测试和质量反馈",
      principle: "测试是对行为契约的自动化描述。不同层级测试覆盖不同风险：单元测试反馈快，集成测试验证协作，端到端测试覆盖关键路径。",
      usage: "按风险选择测试层级，优先覆盖高价值业务路径、易回归逻辑和跨模块契约。",
      practice: "在组件、接口和关键流程中建立稳定测试数据、Mock 边界和 CI 报告，避免测试只在本地有效。",
      pitfalls: ["只追求覆盖率数字", "测试依赖执行顺序或真实外部服务", "E2E 过多导致反馈慢且不稳定"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-18")) {
    return {
      domain: "前端架构边界、组件模型、状态流、微前端和工程组织",
      principle: "架构设计的本质是管理变化成本。好的前端架构会把业务能力、技术实现和发布边界分离，让团队在需求变化时能局部调整。",
      usage: "先识别领域边界、数据流和团队协作方式，再选择分层、状态管理、微前端或 Monorepo。",
      practice: "在大型项目中，用模块依赖规则、目录约定、公共组件治理和发布策略保持长期可维护性。",
      pitfalls: ["为了架构而架构", "过早引入微前端或复杂状态模型", "缺少边界规则导致公共层膨胀"],
      difficulty: "高级",
    }
  }

  if (chapterSlug.includes("chapter-19")) {
    return {
      domain: "设计系统、Design Tokens、组件库、主题和设计到代码协作",
      principle: "设计系统不是组件集合，而是设计语言、工程实现和治理流程的统一。它让视觉一致性、可访问性和交付效率可持续。",
      usage: "从 token、组件 API、状态、可访问性和文档开始建设，避免一开始追求覆盖所有业务场景。",
      practice: "将设计变量、代码变量、组件示例和变更记录打通，让设计和开发共享同一套约束。",
      pitfalls: ["组件库只追求视觉还原", "token 命名缺少语义", "没有版本策略和废弃流程"],
      difficulty: title.includes("编译") ? "高级" : "进阶",
    }
  }

  if (chapterSlug.includes("chapter-23")) {
    return {
      domain: "真实用户监控、错误监控、日志、链路追踪和体验分析",
      principle: "可观测性把线上系统从黑盒变成可解释对象。前端不仅要知道页面报错，还要知道用户环境、操作路径、性能阶段和后端链路。",
      usage: "定义指标、事件、采样和隐私边界，再接入 SDK、Source Map、Trace Context 和告警规则。",
      practice: "上线新功能时同步埋点、错误分组、性能预算和回滚标准，形成发现、定位、修复、验证闭环。",
      pitfalls: ["无节制采集用户数据", "只收集错误但没有版本和用户路径", "告警阈值过宽或过窄导致噪音"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-24")) {
    return {
      domain: "Web 攻击面、漏洞成因、防护策略和检测清单",
      principle: "安全漏洞通常来自信任边界错误：把用户输入、第三方依赖、浏览器上下文或网络链路当成可信。理解攻击路径才能设计有效防护。",
      usage: "每类漏洞都应同时考虑输入处理、输出编码、权限校验、浏览器策略和日志审计。",
      practice: "在需求评审、代码审查和上线检查中引入威胁建模，对高风险页面做专项验证。",
      pitfalls: ["只修复表面 payload", "依赖前端隐藏按钮做权限控制", "忽略第三方脚本和依赖链风险"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-25")) {
    return {
      domain: "会话、授权、身份提供方、无密码认证和账户安全",
      principle: "认证回答你是谁，授权回答你能做什么，会话管理负责在多次请求之间维持可信状态。三者混淆会带来严重安全问题。",
      usage: "明确令牌生命周期、刷新策略、存储位置、撤销机制和跨站请求边界。",
      practice: "在多端登录、管理后台和开放平台中，把登录流程、权限模型和审计日志作为整体设计。",
      pitfalls: ["把 JWT 当作可撤销会话", "在不安全位置长期保存敏感令牌", "没有处理退出登录、设备丢失和权限变更"],
      difficulty: title.includes("Web Crypto") ? "高级" : "进阶",
    }
  }

  if (chapterSlug.includes("chapter-26")) {
    return {
      domain: "Node.js 服务端能力、API 层、数据访问、鉴权和 BFF 边界",
      principle: "前端全栈中的 Node.js 常用于连接浏览器、业务服务和数据层。它的价值在于协议适配、聚合编排、渲染协同和边缘逻辑。",
      usage: "根据请求类型区分 API 服务、BFF、SSR、实时网关和后台任务，并用中间件、 schema 和日志保持可维护。",
      practice: "在中后台和内容站中，用 BFF 聚合接口、处理权限、缓存热点数据，并为前端提供稳定契约。",
      pitfalls: ["把 BFF 写成新的单体后端", "忽略超时、重试和限流", "在 Node 层泄露后端内部模型"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-27")) {
    return {
      domain: "移动端 Web、小程序、跨平台原生、桌面应用和 WebAssembly",
      principle: "跨端开发是在多平台能力、性能、体验和维护成本之间取平衡。不同方案的差异来自渲染层、桥接层、运行时和发布渠道。",
      usage: "先确认目标平台能力、性能要求、团队栈和发布约束，再选择 Web、跨平台框架或原生混合方案。",
      practice: "适合把业务逻辑、设计系统和数据层复用，把平台特有能力隔离在适配层。",
      pitfalls: ["期待一套代码无成本覆盖所有平台", "忽略平台审核和系统权限差异", "没有为弱网、低端设备和离线状态设计"],
      difficulty: "进阶",
    }
  }

  if (chapterSlug.includes("chapter-28")) {
    return {
      domain: "图形渲染、数据可视化、GPU 管线、地图和媒体流",
      principle: "可视化和图形编程关注数据如何映射为像素、几何、纹理或交互图层。不同技术在表达能力、性能和可访问性上各有取舍。",
      usage: "根据数据规模、交互复杂度、动画要求和导出需求选择 Canvas、SVG、WebGL、WebGPU 或图表库。",
      practice: "在监控大屏、地图、编辑器和 3D 场景中，先确定数据更新频率和渲染瓶颈，再优化绘制策略。",
      pitfalls: ["数据量很大仍用大量 DOM 节点渲染", "忽略高 DPR 和内存占用", "只关注视觉效果而忽略交互和可访问性"],
      difficulty: title.includes("WebGPU") || title.includes("WebGL") ? "高级" : "进阶",
    }
  }

  return {
    domain: "前端工程知识体系",
    principle: "该主题需要同时关注概念边界、运行机制和工程取舍。掌握它的关键不是记住术语，而是能在真实项目中判断何时使用、如何验证、如何规避风险。",
    usage: "从最小场景开始验证，再逐步引入工程化约束。",
    practice: "在业务项目中应结合性能、安全、可维护性和团队协作成本综合决策。",
    pitfalls: ["只记 API 不理解边界", "忽略浏览器和运行时差异", "缺少上线后的验证手段"],
    difficulty: "进阶",
  }
}

/**
 * 为文章生成可读的四段式正文。
 * @param {{title: string, description: string, chapter: string, tags: string[], slug: string}} doc 当前文档信息。
 * @param {{domain: string, principle: string, usage: string, practice: string, pitfalls: string[]}} profile 章节画像。
 * @returns {string} 生成后的 MDX 正文。
 */
function buildBody(doc, profile) {
  const title = escapeMarkdownText(topicName(doc.title))
  const description = escapeMarkdownText(doc.description || title)
  const chapter = escapeMarkdownText(doc.chapter)
  const terms = extractTerms(doc.description, doc.tags).map(escapeMarkdownText)
  const termList = terms.length > 0 ? terms : [title]
  const tagText = doc.tags.length > 0 ? doc.tags.map(escapeMarkdownText).join("、") : title
  const primary = termList[0]
  const secondary = termList[1] || "工程边界"
  const third = termList[2] || "运行机制"
  const fourth = termList[3] || "实践约束"

  const pitfallRows = profile.pitfalls
    .map((item) => `| ${escapeMarkdownText(item)} | 先定位现象和边界，再用工具或日志验证根因，避免用经验猜测。 |`)
    .join("\n")

  return `## 原理

${title} 关注的是「${description}」。在「${chapter}」中，它承担的是把概念、运行机制和工程决策连接起来的角色：既要知道浏览器或工具链为什么这样设计，也要知道项目中应该如何处理它。

从前端视角看，这个主题主要落在 ${escapeMarkdownText(profile.domain)} 之间。${escapeMarkdownText(profile.principle)}

可以先把它拆成三个层次理解：

- **概念边界**：明确 ${primary} 涉及的问题，以及它不负责的部分。
- **关键机制**：观察 ${secondary}、${third} 等环节如何协作，避免只记结论。
- **工程取舍**：结合 ${fourth}、兼容性、性能、安全和维护成本做选择。

相关关键词包括：${tagText}。阅读时建议把这些关键词和浏览器 DevTools、构建日志、运行时行为或业务链路对应起来，这样知识点不会停留在定义层面。

## 用法

处理 ${title} 相关问题时，可以按下面的顺序落地：

1. 明确目标场景：当前是在理解机制、提升性能、增强安全、改善体验，还是降低协作成本。
2. 建立最小样例：先在小范围验证 ${primary} 的行为，再接入真实业务。
3. 记录边界条件：包括浏览器支持、运行时限制、数据规模、失败路径和回退策略。
4. 接入验证手段：通过测试、日志、性能面板、构建产物或安全扫描证明方案有效。

\`\`\`ts
// 示例：用清单化方式沉淀 ${title} 的接入决策
type TopicChecklist = {
  goal: string
  constraints: string[]
  validation: string[]
}

const checklist: TopicChecklist = {
  goal: ${JSON.stringify(description)},
  constraints: ["兼容性", "性能预算", "安全边界", "团队维护成本"],
  validation: ["最小样例", "自动化测试", "线上监控"],
}

console.table(checklist)
\`\`\`

${escapeMarkdownText(profile.usage)}

## 实践

在真实项目中，${title} 通常不会单独出现，而是和页面结构、数据流、构建流程、权限模型或性能目标一起发生作用。比较稳妥的实践路径是：

- **设计前置**：把 ${primary} 相关目标、风险和边界写进技术方案，说明为什么需要处理它。
- **渐进接入**：先覆盖一条核心链路，确认没有破坏现有行为。
- **可观测验证**：上线后观察错误率、耗时、资源体积、用户行为或安全告警。
- **文档沉淀**：将配置、约定、示例和常见问题写入团队文档。

例如在业务迭代中，如果 ${secondary} 出现异常，不应直接替换技术方案，而应先判断问题来自输入数据、运行环境、工具配置、浏览器限制还是团队使用方式。${escapeMarkdownText(profile.practice)}

## 陷阱

| 常见问题 | 处理建议 |
|---|---|
${pitfallRows}
| 忽略失败路径 | 为异常、权限拒绝、网络失败、构建失败或降级场景准备明确处理逻辑。 |
| 缺少长期维护策略 | 把规则、示例和验证方式写入文档，并在 CI 或发布流程中持续检查。 |

判断一个方案是否可靠，不只看它在理想环境下是否可用，还要看它在边界条件、异常输入、低性能设备和团队长期维护中是否仍然可控。
`
}

/**
 * 生成可解析的 YAML 关系数组。
 * @param {{title: string, slug: string}[]} items 关系条目。
 * @returns {string[]} YAML 行。
 */
function relationLines(items) {
  const lines = []
  for (const item of items) {
    lines.push(`  - title: ${JSON.stringify(item.title)}`)
    lines.push(`    slug: ${JSON.stringify(item.slug)}`)
  }
  return lines
}

/**
 * 更新 frontmatter：补状态、更新时间、难度和空关系。
 * @param {string[]} lines 原 frontmatter 行。
 * @param {{difficulty: string, related: {title: string, slug: string}[], crossRefs: {title: string, slug: string}[]}} patch 更新信息。
 * @returns {string} 更新后的 frontmatter 文本。
 */
function updateFrontmatter(lines, patch) {
  const output = []
  let skipBlock = null
  let hasStatus = false

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    if (skipBlock) {
      const startsNewKey = /^[A-Za-z0-9_-]+:/.test(line)
      if (!startsNewKey && line.trim() !== "") continue
      skipBlock = null
    }

    if (/^difficulty:/.test(line)) {
      output.push(`difficulty: "${patch.difficulty}"`)
      continue
    }

    if (/^lastUpdated:/.test(line)) {
      output.push(`lastUpdated: "${updatedDate}"`)
      continue
    }

    if (/^status:/.test(line)) {
      hasStatus = true
      output.push(`status: "基本完成"`)
      continue
    }

    if (/^related:/.test(line)) {
      if (patch.related.length === 0) {
        output.push("related: []")
      } else {
        output.push("related:")
        output.push(...relationLines(patch.related))
      }
      skipBlock = "related"
      continue
    }

    if (/^crossRefs:/.test(line)) {
      if (patch.crossRefs.length === 0) {
        output.push("crossRefs: []")
      } else {
        output.push("crossRefs:")
        output.push(...relationLines(patch.crossRefs))
      }
      skipBlock = "crossRefs"
      continue
    }

    output.push(line)
  }

  if (!hasStatus) {
    const difficultyIndex = output.findIndex((line) => /^difficulty:/.test(line))
    const insertIndex = difficultyIndex >= 0 ? difficultyIndex + 1 : output.length
    output.splice(insertIndex, 0, `status: "基本完成"`)
  }

  return output.join("\n")
}

/**
 * 扫描所有 MDX 文档，生成后续补写所需的元数据。
 * @returns {{path: string, slug: string, chapterSlug: string, data: Record<string, string>, hasPlaceholder: boolean}[]}
 */
function collectDocs() {
  const docs = []

  for (const volume of sortedEntries(contentDirectory).filter((entry) => entry.isDirectory())) {
    const volumePath = path.join(contentDirectory, volume.name)
    for (const chapter of sortedEntries(volumePath).filter((entry) => entry.isDirectory())) {
      const chapterPath = path.join(volumePath, chapter.name)
      for (const file of sortedEntries(chapterPath).filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))) {
        const filePath = path.join(chapterPath, file.name)
        const raw = fs.readFileSync(filePath, "utf-8")
        const parsed = parseDocument(raw)
        const slug = `${volume.name}/${chapter.name}/${file.name.replace(/\.mdx$/, "")}`

        docs.push({
          path: filePath,
          slug,
          chapterSlug: `${volume.name}/${chapter.name}`,
          data: parsed.data,
          hasPlaceholder:
            raw.includes("内容待补充...") ||
            (process.env.REFRESH_GENERATED === "1" &&
              raw.includes('status: "基本完成"') &&
              raw.includes("示例：用清单化方式沉淀")),
        })
      }
    }
  }

  return docs
}

/**
 * 为当前文章挑选相邻和同章文章作为关系。
 * @param {{slug: string, chapterSlug: string, data: Record<string, string>}} doc 当前文章。
 * @param {{slug: string, chapterSlug: string, data: Record<string, string>}[]} docs 全部文章。
 * @returns {{related: {title: string, slug: string}[], crossRefs: {title: string, slug: string}[]}}
 */
function buildRelations(doc, docs) {
  const sameChapter = docs.filter((item) => item.chapterSlug === doc.chapterSlug && item.slug !== doc.slug)
  const currentIndex = docs.findIndex((item) => item.slug === doc.slug)
  const sameChapterWithSelf = docs.filter((item) => item.chapterSlug === doc.chapterSlug)
  const chapterIndex = sameChapterWithSelf.findIndex((item) => item.slug === doc.slug)
  const nearby = [
    sameChapterWithSelf[chapterIndex - 1],
    sameChapterWithSelf[chapterIndex + 1],
    sameChapterWithSelf[chapterIndex - 2],
    sameChapterWithSelf[chapterIndex + 2],
  ].filter(Boolean)

  const relatedSource = (nearby.length > 0 ? nearby : sameChapter).slice(0, 3)
  const related = relatedSource.map((item) => ({
    title: item.data.title || item.slug,
    slug: item.slug,
  }))

  const crossRefs = [docs[currentIndex - 1], docs[currentIndex + 1]]
    .filter(Boolean)
    .filter((item) => item.slug !== doc.slug)
    .slice(0, 2)
    .map((item) => ({
      title: item.data.title || item.slug,
      slug: item.slug,
    }))

  return { related, crossRefs }
}

/**
 * 主流程：只改仍包含占位符的文件，避免覆盖已经人工补写的正文。
 * @returns {void}
 */
function main() {
  const docs = collectDocs()
  let changed = 0

  for (const doc of docs.filter((item) => item.hasPlaceholder)) {
    const raw = fs.readFileSync(doc.path, "utf-8")
    const parsed = parseDocument(raw)
    const tags = parseTags(parsed.data.tags)
    const profile = profileFor(doc.chapterSlug, parsed.data.title || "")
    const relations = buildRelations(doc, docs)
    const frontmatter = updateFrontmatter(parsed.lines, {
      difficulty: profile.difficulty || parsed.data.difficulty || "进阶",
      related: relations.related,
      crossRefs: relations.crossRefs,
    })
    const body = buildBody(
      {
        title: parsed.data.title || doc.slug,
        description: parsed.data.description || "",
        chapter: parsed.data.chapter || doc.chapterSlug,
        tags,
        slug: doc.slug,
      },
      profile
    )

    fs.writeFileSync(doc.path, `---\n${frontmatter}\n---\n\n${body}`, "utf-8")
    changed++
  }

  console.log(`Filled ${changed} skeleton MDX files.`)
}

main()
