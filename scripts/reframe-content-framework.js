/**
 * 文件功能说明：
 * 将仍然带有通用批量模板痕迹的 MDX 文章重构为更有学习价值的章节内容框架。
 * 脚本会保留 frontmatter 与已有关系数据，只替换模板化正文，避免覆盖已经人工深写的文章。
 */

const fs = require("fs")
const path = require("path")
const matter = require("gray-matter")

/** 内容根目录：所有百科正文 MDX 文件均按卷、章、小节存放在此目录下。 */
const contentDirectory = path.join(process.cwd(), "content")

/** 本次框架重构日期：写入 frontmatter，方便后续追踪内容维护批次。 */
const updatedDate = "2026-06-26"

/** 模板特征文本：命中任一文本即认为该文章仍是低信息密度的批量生成稿。 */
const templateMarkers = [
  "核心不是记住几个 API 名称",
  "示例代码只展示最小结构",
  "判断内容是否真正完成",
  "为了把本节从“框架完整”继续推进到“内容深写”",
]

/**
 * 章节画像配置：
 * 按章定义学习定位、分析维度、实践场景和诊断方式，让批量框架不再只有一套空泛话术。
 */
const chapterProfiles = {
  "chapter-11": {
    domain: "React 应用",
    thesis: "把状态变化、渲染调度、副作用和服务端能力放到同一条 UI 交付链路里理解。",
    mentalModel: "React 的核心不是模板语法，而是状态快照如何经过 render、reconcile、commit 和调度策略变成用户可见的界面。",
    coreQuestions: ["状态属于谁", "渲染边界在哪里", "副作用何时运行", "服务端与客户端如何交接"],
    decisionAxes: ["组件边界", "状态来源", "渲染时机", "缓存与失效", "测试覆盖"],
    diagnostics: ["React DevTools Profiler", "hydration warning", "render 次数", "bundle 分析", "用户交互耗时"],
    scenes: ["高交互表单", "SSR/SSG 内容页", "复杂列表与筛选", "跨页面状态共享"],
    pitfalls: ["把所有数据塞进全局状态", "在 render 阶段执行副作用", "忽略并发渲染下的可中断与重放"],
    references: ["https://react.dev/learn", "https://react.dev/reference/react", "https://nextjs.org/docs"],
  },
  "chapter-12": {
    domain: "Vue 应用",
    thesis: "围绕响应式依赖、模板编译、组件更新和组合式逻辑建立可解释的开发模型。",
    mentalModel: "Vue 把状态与视图之间的依赖关系显式收集起来，再通过编译优化和更新队列降低手写 DOM 更新成本。",
    coreQuestions: ["依赖是否精确", "副作用是否可清理", "模板是否可优化", "组件职责是否过重"],
    decisionAxes: ["ref/reactive 选择", "computed/watch 边界", "Composables 抽象", "Pinia 与路由状态", "SSR 与客户端激活"],
    diagnostics: ["Vue DevTools", "组件更新高亮", "watch 触发次数", "bundle 分析", "hydration mismatch"],
    scenes: ["复杂表单", "列表详情联动", "组件库封装", "Nuxt 页面渲染"],
    pitfalls: ["解构 reactive 后丢失响应性", "滥用深度 watch", "把 Vue 2 与 Vue 3 的限制混为一谈"],
    references: ["https://vuejs.org/guide/introduction.html", "https://vuejs.org/guide/extras/reactivity-in-depth.html"],
  },
  "chapter-13": {
    domain: "Angular 应用",
    thesis: "把依赖注入、模板编译、变更检测、路由表单和 RxJS 看成一套企业应用约束系统。",
    mentalModel: "Angular 的价值来自框架级一致性：服务、组件、模板和数据流都被放进可预测的生命周期和依赖树中。",
    coreQuestions: ["注入边界如何划分", "变更检测何时触发", "Observable 生命周期谁负责", "表单和路由状态如何建模"],
    decisionAxes: ["Standalone/NgModule", "Default/OnPush", "Reactive Forms", "RxJS 操作符", "SSR/hydration"],
    diagnostics: ["Angular DevTools", "change detection cycles", "subscription 泄漏", "bundle 分析", "模板类型检查"],
    scenes: ["后台管理系统", "复杂表单", "权限路由", "多团队企业应用"],
    pitfalls: ["不了解 Zone.js 与变更检测关系", "模板里放复杂计算", "未取消订阅或缺少错误处理"],
    references: ["https://angular.dev/overview", "https://rxjs.dev/guide/overview"],
  },
  "chapter-14": {
    domain: "现代前端框架选型",
    thesis: "比较框架时从渲染模型、状态更新粒度、服务端集成、生态成熟度和团队成本出发。",
    mentalModel: "新框架通常用编译时优化、细粒度响应式、岛屿架构、可恢复性或服务端优先来减少首屏与交互成本。",
    coreQuestions: ["性能收益来自哪里", "运行时成本是否转移到构建期", "生态缺口如何补齐", "迁移边界在哪里"],
    decisionAxes: ["首屏加载", "交互恢复", "数据获取", "部署环境", "生态和招聘"],
    diagnostics: ["真实业务切片 benchmark", "LCP/INP/CLS", "bundle 与 hydration 成本", "开发效率反馈"],
    scenes: ["内容站", "营销页", "高互动应用试点", "局部性能瓶颈改造"],
    pitfalls: ["把宣传语等同于收益", "只看单项 benchmark", "忽略生态和长期维护成本"],
    references: ["https://svelte.dev/docs", "https://www.solidjs.com/docs", "https://docs.astro.build/"],
  },
  "chapter-15": {
    domain: "构建工具链",
    thesis: "从依赖解析、模块转换、开发反馈、生产产物和发布流程理解工具链的工程价值。",
    mentalModel: "工具链的目标不是堆工具，而是让构建可复现、反馈足够快、产物可分析、发布可回滚。",
    coreQuestions: ["依赖图是否稳定", "开发与生产是否一致", "产物是否可解释", "发布失败如何回滚"],
    decisionAxes: ["包管理器", "模块格式", "代码分割", "缓存策略", "库与应用产物"],
    diagnostics: ["lockfile diff", "bundle analyzer", "构建缓存命中率", "CI 时长", "source map 可用性"],
    scenes: ["单页应用", "组件库发布", "Monorepo", "构建性能治理"],
    pitfalls: ["混用包管理器", "只看 dev server 速度", "忽略 ESM/CJS 与 exports 兼容"],
    references: ["https://docs.npmjs.com/", "https://pnpm.io/", "https://vite.dev/guide/", "https://webpack.js.org/concepts/"],
  },
  "chapter-16": {
    domain: "代码质量体系",
    thesis: "把格式化、静态检查、类型检查、提交门禁、文档和评审串成前移反馈闭环。",
    mentalModel: "质量工具不是为了制造规则，而是把机器能判断的问题交给机器，把代码审查留给设计与风险。",
    coreQuestions: ["规则能否自动修复", "CI 是否强制执行", "团队是否理解规则原因", "例外如何登记"],
    decisionAxes: ["规则严格度", "本地反馈速度", "CI 门禁", "文档约定", "评审关注点"],
    diagnostics: ["lint 失败分布", "typecheck 耗时", "pre-commit 命中率", "代码审查返工原因"],
    scenes: ["团队协作规范", "遗留项目治理", "组件库维护", "大型仓库门禁"],
    pitfalls: ["规则过严导致绕过工具", "只在本地执行", "把风格争论留到代码审查"],
    references: ["https://eslint.org/docs/latest/", "https://prettier.io/docs/en/", "https://stylelint.io/"],
  },
  "chapter-17": {
    domain: "测试体系",
    thesis: "按风险选择测试层级，用自动化证据证明关键行为、交互路径和跨模块契约不会退化。",
    mentalModel: "测试不是覆盖率数字，而是对业务行为的可执行描述；不同层级测试负责不同风险。",
    coreQuestions: ["风险在哪一层", "测试是否稳定", "失败能否定位", "Mock 边界是否真实"],
    decisionAxes: ["单元/集成/E2E", "测试数据", "Mock 策略", "可访问性", "性能与契约"],
    diagnostics: ["flaky rate", "覆盖率差异", "CI 失败日志", "截图差异", "契约校验结果"],
    scenes: ["核心业务流程", "组件交互", "API 契约", "性能回归"],
    pitfalls: ["只追求覆盖率", "E2E 过多导致反馈慢", "测试依赖执行顺序或真实外部服务"],
    references: ["https://playwright.dev/", "https://vitest.dev/", "https://testing-library.com/docs/"],
  },
  "chapter-18": {
    domain: "前端架构",
    thesis: "用边界、依赖方向、状态流和发布粒度控制长期变化成本。",
    mentalModel: "架构不是目录漂亮，而是让需求变化能被限制在局部，让团队知道代码应该放在哪里、依赖谁、如何发布。",
    coreQuestions: ["领域边界在哪里", "依赖方向是否清晰", "状态是否可追踪", "发布是否能局部化"],
    decisionAxes: ["分层方式", "组件粒度", "状态模型", "微前端边界", "仓库治理"],
    diagnostics: ["循环依赖", "公共层膨胀", "跨模块改动范围", "发布频率", "故障隔离"],
    scenes: ["大型中后台", "多团队协作", "组件库治理", "渐进式重构"],
    pitfalls: ["为了架构而架构", "过早引入微前端", "缺少边界规则导致公共层膨胀"],
    references: ["https://martinfowler.com/articles/micro-frontends.html", "https://nx.dev/concepts/more-concepts/monorepo-nx-enterprise"],
  },
  "chapter-18a": {
    domain: "现代 Web 渲染架构",
    thesis: "比较 CSR、SSR、SSG、ISR、Streaming 和 RSC 时，要同时评估数据新鲜度、交互成本和部署边界。",
    mentalModel: "渲染架构决定 HTML 从哪里生成、数据在哪里等待、交互何时恢复，以及缓存失效如何传播。",
    coreQuestions: ["首屏需要什么数据", "HTML 是否可缓存", "交互何时可用", "失败如何降级"],
    decisionAxes: ["数据新鲜度", "缓存粒度", "hydration 成本", "边缘部署", "SEO 与体验"],
    diagnostics: ["TTFB", "LCP", "hydration error", "cache hit rate", "server timing"],
    scenes: ["内容站", "电商详情页", "后台应用", "多区域部署"],
    pitfalls: ["用 SSR 解决所有问题", "忽略缓存失效", "只优化首屏不看交互恢复"],
    references: ["https://nextjs.org/docs", "https://web.dev/articles/rendering-on-the-web"],
  },
  "chapter-19": {
    domain: "设计系统与 UI 工程",
    thesis: "把设计语言、token、组件 API、主题、响应式和治理流程连接成可持续交付系统。",
    mentalModel: "设计系统不是组件仓库，而是让设计约束、代码实现和版本治理共享同一套语义。",
    coreQuestions: ["token 是否有语义", "组件状态是否完整", "无障碍是否内建", "变更如何发布"],
    decisionAxes: ["token 层级", "组件 API", "主题模式", "图标与资源", "文档和版本"],
    diagnostics: ["视觉回归", "a11y 检查", "token 覆盖率", "组件使用分布", "破坏性变更记录"],
    scenes: ["组件库建设", "多主题产品", "设计稿到代码", "品牌一致性治理"],
    pitfalls: ["只追求视觉还原", "token 命名缺少语义", "没有版本策略和废弃流程"],
    references: ["https://www.w3.org/community/design-tokens/", "https://storybook.js.org/docs"],
  },
  "chapter-19a": {
    domain: "编译原理与工具链实现",
    thesis: "用词法、语法、AST、转换和代码生成解释前端工具为什么能做语法转换、检查和优化。",
    mentalModel: "编译器把源码变成可分析的数据结构，再通过规则和插件完成转换；理解管线才能写出可靠工具。",
    coreQuestions: ["源码如何变成 AST", "节点如何遍历和改写", "source map 如何保持可调试", "插件边界在哪里"],
    decisionAxes: ["parser 选择", "AST 兼容性", "转换顺序", "性能", "调试信息"],
    diagnostics: ["AST Explorer", "插件快照测试", "source map 映射", "构建耗时", "边界语法样例"],
    scenes: ["Babel 插件", "lint 规则", "代码生成", "迁移脚本"],
    pitfalls: ["用正则改代码", "忽略注释和格式保留", "没有覆盖边界语法"],
    references: ["https://babeljs.io/docs/", "https://github.com/estree/estree", "https://astexplorer.net/"],
  },
  "chapter-23": {
    domain: "前端可观测性",
    thesis: "把真实用户性能、错误、日志、链路追踪和体验分析连接成发现、定位、修复、验证闭环。",
    mentalModel: "可观测性不是埋点越多越好，而是用最小必要数据回答线上发生了什么、影响谁、为什么发生。",
    coreQuestions: ["指标定义是否稳定", "采样是否合理", "隐私边界是否清楚", "告警是否可行动"],
    decisionAxes: ["采集粒度", "采样率", "Source Map", "Trace Context", "告警阈值"],
    diagnostics: ["RUM 分位数", "错误分组", "trace id", "日志上下文", "版本维度"],
    scenes: ["新功能上线", "性能劣化定位", "错误爆发", "用户路径分析"],
    pitfalls: ["无节制采集用户数据", "只收集错误没有版本和路径", "告警噪音过大"],
    references: ["https://web.dev/vitals/", "https://opentelemetry.io/docs/languages/js/", "https://docs.sentry.io/platforms/javascript/"],
  },
  "chapter-24": {
    domain: "Web 安全攻防",
    thesis: "从信任边界、攻击入口、浏览器策略、服务端校验和审计响应构建防护体系。",
    mentalModel: "漏洞通常不是单个字符串问题，而是不可信数据越过边界进入了执行、权限或敏感数据上下文。",
    coreQuestions: ["资产是什么", "入口在哪里", "攻击链如何闭合", "服务端是否重新校验"],
    decisionAxes: ["输入处理", "输出编码", "权限校验", "浏览器安全头", "依赖供应链"],
    diagnostics: ["安全扫描", "payload 回归集", "CSP report", "依赖审计", "权限绕过测试"],
    scenes: ["登录支付", "富文本", "后台管理", "第三方脚本接入"],
    pitfalls: ["只修复表面 payload", "依赖前端隐藏按钮做权限", "忽略第三方脚本和依赖链"],
    references: ["https://owasp.org/www-project-top-ten/", "https://cheatsheetseries.owasp.org/", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"],
  },
  "chapter-25": {
    domain: "身份认证与授权",
    thesis: "区分认证、授权和会话管理，设计凭证生命周期、撤销机制和跨端安全边界。",
    mentalModel: "认证回答你是谁，授权回答你能做什么，会话负责在多次请求之间维持可信状态。",
    coreQuestions: ["凭证存在哪里", "如何刷新和撤销", "权限变更何时生效", "跨站请求如何防护"],
    decisionAxes: ["Cookie/Token", "刷新策略", "SSO 协议", "MFA", "设备与风险"],
    diagnostics: ["Set-Cookie 属性", "token 过期路径", "重放测试", "权限审计日志", "异常登录告警"],
    scenes: ["管理后台", "开放平台", "多端登录", "高风险操作"],
    pitfalls: ["把 JWT 当作可撤销会话", "长期保存敏感令牌", "没有处理退出登录和权限变更"],
    references: ["https://oauth.net/2/", "https://openid.net/developers/how-connect-works/", "https://webauthn.guide/"],
  },
  "chapter-25a": {
    domain: "Web Crypto 与前端密码学",
    thesis: "明确浏览器端密码学能解决什么、不能解决什么，以及密钥、随机数和数据边界如何管理。",
    mentalModel: "前端加密通常用于保护传输前数据或实现端到端场景，但不能替代服务端认证、授权和密钥治理。",
    coreQuestions: ["密钥从哪里来", "算法是否适合场景", "随机数是否安全", "数据解密边界在哪里"],
    decisionAxes: ["对称/非对称", "哈希与签名", "密钥派生", "浏览器兼容", "错误处理"],
    diagnostics: ["SubtleCrypto 支持", "向量测试", "密钥导入导出", "异常路径", "安全评审"],
    scenes: ["端到端加密", "本地敏感数据保护", "签名校验", "WebAuthn 补充理解"],
    pitfalls: ["自创加密算法", "把密钥硬编码在前端", "混淆编码、哈希和加密"],
    references: ["https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API", "https://www.w3.org/TR/WebCryptoAPI/"],
  },
  "chapter-25b": {
    domain: "隐私合规与数据治理",
    thesis: "把数据收集目的、用户同意、最小化、保留周期和可审计能力前置到产品与工程流程。",
    mentalModel: "隐私治理回答数据为什么被使用、如何被使用、保留多久、谁能访问、用户如何撤回。",
    coreQuestions: ["数据是否必要", "是否获得有效同意", "是否可删除", "是否可审计"],
    decisionAxes: ["数据分类", "同意管理", "最小化采集", "保留周期", "跨境与第三方"],
    diagnostics: ["数据地图", "埋点审计", "同意日志", "删除请求演练", "第三方 SDK 清单"],
    scenes: ["用户分析", "广告归因", "日志采集", "跨境产品"],
    pitfalls: ["先采集后补同意", "埋点字段无限扩张", "第三方 SDK 未纳入治理"],
    references: ["https://gdpr.eu/", "https://www.w3.org/TR/permissions-policy-1/"],
  },
  "chapter-26": {
    domain: "Node.js 服务端开发",
    thesis: "用 Node 连接浏览器、业务服务和数据层，承担协议适配、聚合编排、鉴权缓存与边缘逻辑。",
    mentalModel: "前端全栈不是把后端搬进前端，而是在体验层建立稳定契约、超时边界和可观测服务。",
    coreQuestions: ["服务边界是什么", "契约如何演进", "失败如何降级", "缓存与权限如何协作"],
    decisionAxes: ["API 风格", "中间件", "数据访问", "鉴权", "超时限流"],
    diagnostics: ["结构化日志", "trace", "压测", "错误率", "缓存命中率"],
    scenes: ["BFF", "SSR 数据层", "实时网关", "文件上传"],
    pitfalls: ["把 BFF 写成新单体", "忽略超时和限流", "透传后端内部模型"],
    references: ["https://nodejs.org/api/", "https://fastify.dev/docs/latest/", "https://nestjs.com/"],
  },
  "chapter-27": {
    domain: "跨端开发",
    thesis: "在平台能力、体验一致性、性能、发布渠道和维护成本之间做清晰取舍。",
    mentalModel: "跨端复用的核心是业务逻辑、协议和设计约束，而不是幻想一套 UI 无成本覆盖所有平台。",
    coreQuestions: ["平台差异在哪里", "复用边界是什么", "性能瓶颈在哪层", "发布审核如何影响节奏"],
    decisionAxes: ["渲染层", "桥接层", "离线能力", "平台权限", "发布渠道"],
    diagnostics: ["低端设备表现", "启动耗时", "桥接调用次数", "崩溃率", "审核失败原因"],
    scenes: ["移动 Web", "小程序", "跨平台 Native", "桌面端", "Wasm 能力复用"],
    pitfalls: ["期待一套代码覆盖所有体验", "忽略平台审核和权限差异", "没有弱网和离线设计"],
    references: ["https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps", "https://reactnative.dev/docs/getting-started", "https://webassembly.org/"],
  },
  "chapter-28": {
    domain: "可视化与图形编程",
    thesis: "根据数据规模、交互复杂度、渲染管线和设备能力选择 DOM、SVG、Canvas、WebGL、WebGPU 或图表库。",
    mentalModel: "图形开发的关键是数据如何变成像素、几何、纹理和交互图层，以及每次更新会消耗哪部分管线。",
    coreQuestions: ["数据量多大", "更新频率多高", "交互是否复杂", "是否需要导出和无障碍"],
    decisionAxes: ["渲染模型", "数据规模", "动画频率", "DPR 与内存", "可访问性"],
    diagnostics: ["FPS", "GPU memory", "paint cost", "事件命中", "导出质量"],
    scenes: ["监控大屏", "图表分析", "地图", "3D 场景", "编辑器"],
    pitfalls: ["大量 DOM 渲染海量数据", "忽略高 DPR 内存占用", "只关注视觉效果忽略交互和无障碍"],
    references: ["https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API", "https://developer.mozilla.org/en-US/docs/Web/SVG", "https://webgpu.github.io/webgpu-samples/"],
  },
  "chapter-28a": {
    domain: "实时音视频与流媒体",
    thesis: "把采集、编码、传输、缓冲、播放和端到端延迟放到同一条媒体链路里分析。",
    mentalModel: "流媒体体验由网络、协议、播放器缓冲、编码参数和设备能力共同决定，单调一个参数通常不够。",
    coreQuestions: ["延迟目标是多少", "网络波动如何处理", "码率如何自适应", "失败如何重连"],
    decisionAxes: ["HLS/DASH/WebRTC", "编码参数", "缓冲策略", "CDN", "设备能力"],
    diagnostics: ["首帧时间", "卡顿率", "码率切换", "丢包率", "端到端延迟"],
    scenes: ["直播", "点播", "视频会议", "屏幕共享"],
    pitfalls: ["只看平均延迟", "忽略弱网与设备解码能力", "没有重连和降级策略"],
    references: ["https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API", "https://developer.apple.com/streaming/"],
  },
}

/** 默认章节画像：用于没有命中特定章节配置的文章。 */
const defaultProfile = {
  domain: "前端工程知识体系",
  thesis: "把概念、机制、工程取舍和验证方式连接起来，形成能解决真实问题的学习路径。",
  mentalModel: "有价值的百科文章应回答为什么、怎么判断、如何落地、如何验证，而不是只罗列名词。",
  coreQuestions: ["问题边界是什么", "关键机制如何协作", "工程风险在哪里", "验证证据是什么"],
  decisionAxes: ["场景", "约束", "收益", "成本", "回退"],
  diagnostics: ["最小样例", "自动化测试", "日志", "性能数据", "线上反馈"],
  scenes: ["业务接入", "排障定位", "性能优化", "团队协作"],
  pitfalls: ["只记 API 不理解边界", "忽略运行环境差异", "没有验证和回退策略"],
  references: ["https://developer.mozilla.org/"],
}

/**
 * 关键词规则：
 * 根据标题、描述和标签识别更细粒度的机制、决策和验证项，提升每篇文章的差异化信息密度。
 */
const keywordRules = [
  {
    pattern: /webpack|module federation|loader|plugin/i,
    mechanism: "Webpack 通过模块图、loader 转换和 plugin 钩子把源码、样式和资源统一编排。",
    decision: "适合需要深度定制、复杂兼容或 Module Federation 的大型项目；简单应用要评估配置成本。",
    validation: "检查 chunk 拆分、sideEffects、缓存命中和 federation 远程模块加载失败路径。",
    pitfall: "只堆 loader/plugin 而不分析模块图，会让构建慢且产物不可解释。",
  },
  {
    pattern: /vite|esbuild|swc|rollup|parcel|turbopack|rspack|farm/i,
    mechanism: "现代构建工具通常把开发期 ESM 服务、快速转译和生产期打包优化拆成不同阶段。",
    decision: "选型时同时比较冷启动、HMR、生产产物、插件生态和团队迁移成本。",
    validation: "用同一业务切片比较 CI 构建时间、产物体积、source map 和兼容目标。",
    pitfall: "开发服务器很快不代表生产构建质量一定更好。",
  },
  {
    pattern: /npm|yarn|pnpm|semver|workspace|package/i,
    mechanism: "包管理器决定依赖解析、锁文件、软硬链接布局和 workspace 安装语义。",
    decision: "团队需要固定包管理器和 Node 版本，并把 lockfile 当作可复现构建的一部分。",
    validation: "在 CI 中校验 lockfile、包管理器版本、重复依赖和幽灵依赖。",
    pitfall: "SemVer 只是兼容承诺，不能替代锁文件、测试和灰度升级。",
  },
  {
    pattern: /eslint|prettier|stylelint|hooks|review|docs|注释|文档/i,
    mechanism: "质量工具把格式、静态规则、类型和协作约定变成可重复执行的反馈。",
    decision: "能自动修复的交给工具，涉及设计、边界和风险的留给代码审查。",
    validation: "统计规则命中、自动修复比例、CI 失败原因和评审返工原因。",
    pitfall: "规则没有解释和自动修复能力时，团队很容易绕过工具。",
  },
  {
    pattern: /jest|vitest|mocha|playwright|cypress|rtl|storybook|chromatic|msw|coverage|contract|axe|test/i,
    mechanism: "测试层级应与风险层级匹配：单元验证逻辑，组件验证交互，E2E 验证关键路径，契约验证协作边界。",
    decision: "高价值路径优先覆盖，低风险展示逻辑避免用昂贵 E2E 堆砌。",
    validation: "关注 flaky rate、失败定位速度、覆盖率变化和 CI 总时长。",
    pitfall: "只看覆盖率数字会掩盖断言质量和关键路径缺口。",
  },
  {
    pattern: /xss|csrf|点击劫持|mitm|注入|反序列化|泄露|供应链|spectre|xs-leaks/i,
    mechanism: "安全问题来自不可信输入、执行上下文、权限边界或依赖链路被错误信任。",
    decision: "防护要同时覆盖服务端校验、浏览器策略、输出编码、审计和应急。",
    validation: "维护 payload 回归集、安全头检查、依赖审计和权限绕过测试。",
    pitfall: "追着单个 payload 打补丁，通常会漏掉同类上下文。",
  },
  {
    pattern: /session|cookie|oauth|openid|sso|webauthn|passkeys|mfa|jwt|认证|授权/i,
    mechanism: "认证、授权和会话管理分别处理身份确认、资源权限和跨请求可信状态。",
    decision: "凭证存储、刷新、撤销、设备绑定和风险校验必须一起设计。",
    validation: "覆盖登录、刷新、退出、权限变更、设备丢失和跨站请求路径。",
    pitfall: "把 JWT 当作天然可撤销会话，会让权限变更和退出登录失效。",
  },
  {
    pattern: /crypto|aes|rsa|加密|隐私|gdpr|合规|数据治理/i,
    mechanism: "密码学和隐私治理都依赖清晰的数据边界、密钥边界和同意边界。",
    decision: "先定义数据分类和威胁模型，再选择算法、采集策略或保留周期。",
    validation: "用测试向量、同意日志、数据删除演练和第三方 SDK 清单验证。",
    pitfall: "前端硬编码密钥或无目的采集数据，都会让治理失去意义。",
  },
  {
    pattern: /node|express|koa|fastify|nestjs|api|rest|graphql|grpc|trpc|database|orm|serverless|bff|缓存|upload|realtime|websocket|sse/i,
    mechanism: "Node 层常承担协议适配、聚合编排、鉴权、缓存、实时连接和 SSR 数据准备。",
    decision: "先定义对前端稳定的契约，再决定 REST、GraphQL、tRPC、BFF 或 Serverless 边界。",
    validation: "用契约测试、超时注入、压测、trace 和结构化日志证明服务可靠。",
    pitfall: "直接透传后端内部模型，会让前端契约随服务端实现一起震荡。",
  },
  {
    pattern: /react|hooks|jsx|fiber|router|form|hydration|rsc|redux|zustand|jotai|tanstack/i,
    mechanism: "React 把状态快照映射为组件树，再通过 Fiber 调度、提交阶段和生态库管理复杂 UI。",
    decision: "按状态来源划分本地状态、服务端状态、URL 状态和表单状态。",
    validation: "用 Profiler、render 次数、hydration 日志和关键交互耗时验证。",
    pitfall: "把服务端数据、表单状态和 UI 临时状态混进同一个全局 store。",
  },
  {
    pattern: /vue|ref|reactive|composition|pinia|vuex|nuxt|sfc|v-model|watch|computed/i,
    mechanism: "Vue 通过响应式依赖收集、模板编译和更新队列把状态变化同步到视图。",
    decision: "派生状态优先 computed，副作用用 watch，跨页面状态再引入 store。",
    validation: "用 Vue DevTools 检查依赖、更新次数、组件边界和 hydration mismatch。",
    pitfall: "深度 watch 大对象会让性能和可预测性同时变差。",
  },
  {
    pattern: /angular|rxjs|zone|onpush|signals|material|cdk|universal|aot|jit/i,
    mechanism: "Angular 用依赖注入、模板编译、变更检测和 Observable 数据流约束大型应用。",
    decision: "复杂页面优先明确服务边界、变更检测策略和订阅生命周期。",
    validation: "检查模板类型、变更检测次数、订阅清理和路由表单状态。",
    pitfall: "在模板中放复杂计算会被变更检测反复触发。",
  },
  {
    pattern: /svelte|solid|qwik|astro|fresh|remix|框架性能/i,
    mechanism: "新框架的差异通常来自编译时优化、细粒度响应式、岛屿架构、可恢复性或 Web 标准优先。",
    decision: "用真实业务切片比较首屏、交互恢复、数据获取、部署和生态缺口。",
    validation: "同时看 LCP、INP、bundle、hydration 或 resumability 成本。",
    pitfall: "迁移前没有试点和回退方案，会把框架风险变成产品风险。",
  },
  {
    pattern: /architecture|前端架构|分层架构|组件设计|微前端|monorepo|低代码|状态机|cqrs|event sourcing|mvc|clean architecture/i,
    mechanism: "架构通过边界、依赖方向、状态流和发布粒度降低长期变化成本。",
    decision: "只有当复杂度、团队边界或发布节奏真的需要时，才引入更重的架构方案。",
    validation: "观察跨模块改动范围、循环依赖、公共层膨胀和故障隔离效果。",
    pitfall: "缺少约束的公共层会慢慢变成新的单体。",
  },
  {
    pattern: /design token|token|组件库|icon|图标|dark|暗黑|主题|responsive|响应式设计|figma|设计稿|design-to-code/i,
    mechanism: "设计系统把视觉语义、组件 API、主题变量和治理流程绑定到同一套约束里。",
    decision: "先沉淀 token 命名、组件状态和可访问性，再扩大组件覆盖范围。",
    validation: "通过视觉回归、a11y、token 覆盖率和破坏性变更记录验证。",
    pitfall: "只按页面复制组件，会让组件库缺少稳定 API 和可复用语义。",
  },
  {
    pattern: /rum|sentry|source map|logging|opentelemetry|trace|性能预算|ux|监控|日志/i,
    mechanism: "可观测性用指标、事件、日志和链路把线上体验变成可解释证据。",
    decision: "先定义问题要回答什么，再决定采样、字段、告警和隐私边界。",
    validation: "看分位数、版本维度、错误分组、trace 串联和修复后回归。",
    pitfall: "采集很多但无法定位责任边界，等于把噪音写进系统。",
  },
  {
    pattern: /mobile|小程序|taro|uniapp|react native|flutter|electron|tauri|wasm|webassembly|跨端/i,
    mechanism: "跨端方案的差异来自渲染层、桥接层、权限模型、发布渠道和运行时能力。",
    decision: "复用业务逻辑和协议，平台特性隔离在适配层，关键体验按平台优化。",
    validation: "在低端设备、弱网、离线、权限拒绝和审核失败场景下验证。",
    pitfall: "一套代码覆盖所有平台通常意味着体验和问题也被一起平均化。",
  },
  {
    pattern: /canvas|svg|webgl|webgpu|three|d3|echarts|antv|地图|gis|hls|dash|webrtc|流媒体|音视频/i,
    mechanism: "图形与媒体链路把数据、几何、纹理、像素、音视频帧和交互事件映射到设备能力上。",
    decision: "按数据量、更新频率、交互复杂度、导出需求和可访问性选择技术栈。",
    validation: "用 FPS、内存、首帧、卡顿率、DPR 和事件命中数据验证。",
    pitfall: "只看视觉效果而不测低端设备，会把渲染成本留给用户。",
  },
]

/**
 * 读取目录项并按自然数字顺序排序。
 * @param {string} directory 需要读取的目录路径。
 * @returns {fs.Dirent[]} 排序后的目录项。
 */
function sortedEntries(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}

/**
 * 转义普通 Markdown 文本，避免 MDX 将尖括号误判为 JSX。
 * @param {unknown} value 原始文本。
 * @returns {string} 可安全写入 MDX 的文本。
 */
function escapeMarkdownText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * 转义 Markdown 表格单元格。
 * @param {unknown} value 原始单元格内容。
 * @returns {string} 可安全放入 Markdown 表格的内容。
 */
function escapeTableCell(value) {
  return escapeMarkdownText(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ")
}

/**
 * 去除标题开头的章节编号，保留知识点名称。
 * @param {string} title frontmatter 中的完整标题。
 * @returns {string} 去编号后的标题。
 */
function topicName(title) {
  return String(title || "")
    .replace(/^\s*[\da-zA-Z]+(?:[.-][\da-zA-Z]+)?\s+/, "")
    .trim()
}

/**
 * 提取标题、描述和标签中的核心术语。
 * @param {{title: string, description: string, tags: string[]}} doc 当前文档元信息。
 * @returns {string[]} 去重后的核心术语。
 */
function extractTerms(doc) {
  const stopWords = new Set(["API", "vs", "VS", "和", "与", "及", "的", "等", "全解", "实践", "设计"])
  const cleanTitle = topicName(doc.title)
  const titleLead = cleanTitle.split(/[：:]/)[0]?.trim()
  const forcedTerms = titleLead && !stopWords.has(titleLead) ? [titleLead] : []
  const source = [cleanTitle, doc.description, ...(doc.tags || [])].join("、")
  const terms = source
    .replace(/[`"'“”‘’]/g, "")
    .split(/[、，,：:；;\/（）()【】\[\]\s]+/g)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 32)
    .filter((item) => !/^\d+[a-zA-Z]?(?:\.\d+)?$/.test(item))
    .filter((item) => !stopWords.has(item))

  return Array.from(new Set([...forcedTerms, ...terms])).slice(0, 8)
}

/**
 * 根据章节路径获取章节画像。
 * @param {string} chapterSlug 例如 volume-05/chapter-15。
 * @returns {typeof defaultProfile} 章节画像。
 */
function profileFor(chapterSlug) {
  const chapterKey = chapterSlug.split("/").pop()
  return chapterProfiles[chapterKey] || defaultProfile
}

/**
 * 根据文档关键词匹配细粒度规则。
 * @param {{title: string, description: string, tags: string[]}} doc 当前文档元信息。
 * @returns {typeof keywordRules} 命中的关键词规则。
 */
function matchKeywordRules(doc) {
  const haystack = [doc.title, doc.description, ...(doc.tags || [])].join(" ")
  const matched = keywordRules.filter((rule) => rule.pattern.test(haystack))
  return matched.length > 0 ? matched.slice(0, 3) : []
}

/**
 * 解析 frontmatter，并保留原始 frontmatter 文本用于无损回写。
 * @param {string} raw MDX 原始内容。
 * @returns {{frontmatterText: string, body: string, data: Record<string, unknown>}} 解析结果。
 */
function parseDocument(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) {
    return { frontmatterText: "", body: raw, data: {} }
  }

  const parsed = matter(raw)
  return {
    frontmatterText: match[1],
    body: parsed.content,
    data: parsed.data,
  }
}

/**
 * 判断文章正文是否仍是低信息密度的批量模板。
 * @param {string} body MDX 正文。
 * @returns {boolean} 是否需要重构。
 */
function isTemplateBody(body) {
  return templateMarkers.some((marker) => body.includes(marker))
}

/**
 * 更新 frontmatter 中的状态与更新时间。
 * @param {string} frontmatterText 原始 frontmatter 文本。
 * @returns {string} 更新后的 frontmatter 文本。
 */
function updateFrontmatter(frontmatterText) {
  let output = frontmatterText

  if (/^lastUpdated:/m.test(output)) {
    output = output.replace(/^lastUpdated:.*$/m, `lastUpdated: "${updatedDate}"`)
  } else {
    output += `\nlastUpdated: "${updatedDate}"`
  }

  if (/^status:/m.test(output)) {
    output = output.replace(/^status:.*$/m, 'status: "框架重构"')
  } else {
    output += '\nstatus: "框架重构"'
  }

  return output
}

/**
 * 归一化 frontmatter 中的引用项，支持字符串和对象两种格式。
 * @param {unknown} ref 原始引用。
 * @returns {{title: string, slug: string} | null} 归一化后的引用。
 */
function normalizeReference(ref) {
  if (!ref) return null

  if (typeof ref === "string") {
    return {
      title: ref.replace(/\.mdx$/, ""),
      slug: ref.replace(/\.mdx$/, ""),
    }
  }

  if (typeof ref === "object" && ref.slug) {
    return {
      title: String(ref.title || ref.slug),
      slug: String(ref.slug).replace(/\.mdx$/, ""),
    }
  }

  return null
}

/**
 * 提取旧正文中的参考资料链接，避免重构时丢失已有来源。
 * @param {string} body 旧正文。
 * @returns {string[]} Markdown 链接列表。
 */
function extractReferences(body) {
  const referenceMatch = body.match(/## 参考(?:资料)?\s*\n([\s\S]*)$/)
  if (!referenceMatch) return []

  return referenceMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ["))
}

/**
 * 将列表补足到指定数量，优先保留已有内容。
 * @param {string[]} values 原始列表。
 * @param {string[]} fallback 兜底列表。
 * @param {number} size 需要的数量。
 * @returns {string[]} 补足后的列表。
 */
function takeWithFallback(values, fallback, size) {
  return Array.from(new Set([...values, ...fallback])).slice(0, size)
}

/**
 * 构建核心机制表格行。
 * @param {ReturnType<typeof matchKeywordRules>} rules 关键词规则。
 * @param {typeof defaultProfile} profile 章节画像。
 * @param {string[]} terms 核心术语。
 * @returns {string} Markdown 表格行。
 */
function buildMechanismRows(rules, profile, terms) {
  const rows = []
  const fallbackQuestions = takeWithFallback(profile.coreQuestions, defaultProfile.coreQuestions, 4)

  for (const rule of rules) {
    rows.push(
      `| ${escapeTableCell(terms[rows.length] || profile.domain)} | ${escapeTableCell(rule.mechanism)} | ${escapeTableCell(rule.validation)} |`
    )
  }

  while (rows.length < 4) {
    const question = fallbackQuestions[rows.length] || "验证证据是什么"
    const term = terms[rows.length] || profile.decisionAxes[rows.length] || profile.domain
    rows.push(
      `| ${escapeTableCell(term)} | ${escapeTableCell(`围绕“${question}”拆解概念边界、运行机制和失败路径。`)} | ${escapeTableCell(profile.diagnostics[rows.length % profile.diagnostics.length])} |`
    )
  }

  return rows.join("\n")
}

/**
 * 构建工程决策表格行。
 * @param {ReturnType<typeof matchKeywordRules>} rules 关键词规则。
 * @param {typeof defaultProfile} profile 章节画像。
 * @param {string[]} terms 核心术语。
 * @returns {string} Markdown 表格行。
 */
function buildDecisionRows(rules, profile, terms) {
  const ruleRows = rules.map((rule, index) => {
    const axis = profile.decisionAxes[index] || terms[index] || profile.domain
    return {
      axis,
      row: `| ${escapeTableCell(axis)} | ${escapeTableCell(rule.decision)} | ${escapeTableCell(rule.validation)} |`,
    }
  })

  const fallbackRows = profile.decisionAxes.slice(0, 4).map((axis, index) => {
    const scene = profile.scenes[index % profile.scenes.length]
    const diagnostic = profile.diagnostics[index % profile.diagnostics.length]
    return {
      axis,
      row: `| ${escapeTableCell(axis)} | ${escapeTableCell(`在“${scene}”场景下判断收益、成本、失败路径和回退策略。`)} | ${escapeTableCell(diagnostic)} |`,
    }
  })

  const rows = []
  const usedAxes = new Set()

  for (const item of [...ruleRows, ...fallbackRows]) {
    if (usedAxes.has(item.axis)) continue
    usedAxes.add(item.axis)
    rows.push(item.row)
    if (rows.length >= 5) break
  }

  return rows.join("\n")
}

/**
 * 构建常见误区表格行。
 * @param {ReturnType<typeof matchKeywordRules>} rules 关键词规则。
 * @param {typeof defaultProfile} profile 章节画像。
 * @returns {string} Markdown 表格行。
 */
function buildPitfallRows(rules, profile) {
  const fromRules = rules.map((rule) => rule.pitfall)
  const pitfalls = takeWithFallback(fromRules, profile.pitfalls, 5)

  return pitfalls
    .map((pitfall) => {
      const suggestion = pitfall.includes("只")
        ? "把问题拆到上下文、边界、证据和回退方案中验证。"
        : "先用最小场景复现，再决定是否升级方案。"
      return `| ${escapeTableCell(pitfall)} | ${escapeTableCell(suggestion)} |`
    })
    .join("\n")
}

/**
 * 生成与章节画像匹配的 TypeScript 示例代码块。
 * @param {{title: string, chapter: string, description: string}} doc 当前文档元信息。
 * @param {typeof defaultProfile} profile 章节画像。
 * @param {string[]} terms 核心术语。
 * @returns {string} TypeScript 代码块。
 */
function buildCodeExample(doc, profile, terms) {
  const objective = doc.description || topicName(doc.title)
  const constraints = takeWithFallback(terms, profile.decisionAxes, 4)
  const signals = takeWithFallback(profile.diagnostics, defaultProfile.diagnostics, 3)

  return `\`\`\`ts
type ChapterDecision = {
  objective: string
  constraints: string[]
  signals: string[]
  rollback: string
}

/**
 * 生成本节主题的落地决策记录。
 * @param owner 负责验证和维护该方案的角色或小组。
 * @returns 可写入技术方案或评审记录的决策对象。
 */
function createDecisionRecord(owner: string): ChapterDecision {
  return {
    objective: ${JSON.stringify(objective)},
    constraints: ${JSON.stringify(constraints)},
    signals: ${JSON.stringify(signals)},
    // 中文注释：回退策略必须在接入前定义，避免上线后只能被动救火。
    rollback: \`由 \${owner} 负责准备降级开关、兼容方案和验证清单\`,
  }
}

console.table(createDecisionRecord("frontend"))
\`\`\``
}

/**
 * 构建章节关系说明。
 * @param {{related?: unknown[], crossRefs?: unknown[]}} data frontmatter 数据。
 * @returns {string} Markdown 列表。
 */
function buildRelationSection(data) {
  const related = (data.related || []).map(normalizeReference).filter(Boolean).slice(0, 3)
  const crossRefs = (data.crossRefs || []).map(normalizeReference).filter(Boolean).slice(0, 3)

  if (related.length === 0 && crossRefs.length === 0) {
    return "- 先完成本节的概念边界，再回到同章目录补齐相邻知识点。"
  }

  const lines = []
  for (const item of related) {
    lines.push(`- 同章延伸：[${escapeMarkdownText(item.title)}](/${item.slug})`)
  }
  for (const item of crossRefs) {
    lines.push(`- 交叉参照：[${escapeMarkdownText(item.title)}](/${item.slug})`)
  }

  return lines.join("\n")
}

/**
 * 构建新的 MDX 正文框架。
 * @param {{title: string, description: string, chapter: string, tags: string[], related?: unknown[], crossRefs?: unknown[]}} doc 当前文档元信息。
 * @param {string} oldBody 旧正文，用于提取参考资料。
 * @param {typeof defaultProfile} profile 章节画像。
 * @returns {string} 新正文。
 */
function buildBody(doc, oldBody, profile) {
  const safeTitle = escapeMarkdownText(topicName(doc.title))
  const safeChapter = escapeMarkdownText(doc.chapter || "")
  const safeDescription = escapeMarkdownText(doc.description || topicName(doc.title))
  const terms = extractTerms(doc)
  const safeTerms = terms.map(escapeMarkdownText)
  const rules = matchKeywordRules(doc)
  const references = takeWithFallback(extractReferences(oldBody), profile.references.map((link) => `- [${link}](${link})`), 5)

  const learningGoals = takeWithFallback(
    [
      `解释 ${safeTerms[0] || safeTitle} 在 ${escapeMarkdownText(profile.domain)} 中解决的真实问题`,
      `拆解 ${safeTerms[1] || "关键机制"}、${safeTerms[2] || "工程边界"} 与失败路径`,
      `为 ${safeTerms[3] || "业务场景"} 选择可验证、可回退的落地方案`,
    ],
    profile.coreQuestions.map((question) => `围绕“${escapeMarkdownText(question)}”建立判断标准`),
    4
  )

  return `## 章节定位

${safeTitle} 不再只按“是什么、怎么用”展开，而是放回「${safeChapter}」的知识链路中理解：${escapeMarkdownText(profile.thesis)}

> **本节要解决的真实问题**：当项目里遇到 ${safeTerms.slice(0, 4).join("、") || safeTitle} 相关设计、选型、接入或排障时，能说清楚边界、取舍、验证方式和失败后的回退策略。

### 学习目标

| 层次 | 学完后应该能做到 |
|---|---|
| 概念定位 | ${escapeTableCell(learningGoals[0])} |
| 机制理解 | ${escapeTableCell(learningGoals[1])} |
| 工程判断 | ${escapeTableCell(learningGoals[2])} |
| 验证闭环 | ${escapeTableCell(learningGoals[3])} |

## 知识地图

${escapeMarkdownText(profile.mentalModel)}

| 层级 | 本节关注点 | 判断证据 |
|---|---|---|
| 问题入口 | ${escapeTableCell(safeTerms.slice(0, 3).join("、") || safeTitle)} 会在什么业务场景中暴露 | ${escapeTableCell(profile.scenes.slice(0, 2).join("、"))} |
| 运行机制 | ${escapeTableCell(profile.coreQuestions.slice(0, 3).join("；"))} | ${escapeTableCell(profile.diagnostics.slice(0, 2).join("、"))} |
| 工程约束 | ${escapeTableCell(profile.decisionAxes.slice(0, 4).join("、"))} | 兼容性、性能、安全、维护成本和回退方案 |
| 关联知识 | 与同章和跨章内容形成可追踪链路 | 关系链接、示例代码、测试和线上数据 |

### 延展关系

${buildRelationSection(doc)}

## 核心机制

这一节建议沿着“术语 -> 机制 -> 证据”的顺序阅读。先不要急着背 API，先确认每个概念在系统里承担什么职责，以及它失败时会出现什么现象。

| 主题 | 需要理解的机制 | 可观察证据 |
|---|---|---|
${buildMechanismRows(rules, profile, terms)}

<Callout type="tip" title="阅读方法">
读这一节时，建议为每个关键词补一个“最小复现场景”和一个“线上验证信号”。能被复现和验证的知识，才真正能进入工程判断。
</Callout>

## 工程决策

${safeTitle} 的价值在于帮助你做判断，而不是增加术语库存。遇到真实项目时，可以按下面的决策表检查。

| 决策维度 | 应该如何判断 | 验证方式 |
|---|---|---|
${buildDecisionRows(rules, profile, terms)}

## 实战路径

推荐按四步推进：

1. **界定场景**：明确当前是新功能接入、旧系统治理、性能优化、安全加固还是线上排障。
2. **建立样例**：用最小代码或配置复现 ${safeTerms[0] || safeTitle} 的核心行为，不直接在完整业务里猜测。
3. **接入约束**：把 ${escapeMarkdownText(profile.decisionAxes.slice(0, 3).join("、"))} 写进方案，说明不满足时如何降级。
4. **验证沉淀**：用 ${escapeMarkdownText(profile.diagnostics.slice(0, 3).join("、"))} 形成证据，并把结论回写到团队文档。

${buildCodeExample(doc, profile, terms)}

## 诊断与验证

| 现象 | 定位动作 | 判断完成的证据 |
|---|---|---|
| 行为与预期不一致 | 回到最小样例，逐步加入真实数据、环境和配置 | 能明确指出差异来自输入、运行时、配置还是依赖 |
| 性能或稳定性退化 | 记录基线，再观察 ${escapeTableCell(profile.diagnostics.slice(0, 3).join("、"))} | 指标回到预算内，并且关键路径有回归测试 |
| 团队理解不一致 | 把术语、边界、反例和回退策略写进评审记录 | 新成员可以按同一清单复现和验证 |

## 常见误区

| 误区 | 更可靠的处理方式 |
|---|---|
${buildPitfallRows(rules, profile)}

## 后续补写清单

为了把本节从“框架完整”继续推进到“内容深写”，后续每次补充可以按下面顺序加料：

- 补一张机制图：画清楚 ${safeTerms.slice(0, 4).join("、") || safeTitle} 之间的数据流、控制流或依赖关系。
- 补一个真实案例：说明问题背景、错误方案、修正方案和上线后的验证指标。
- 补一段最小可运行代码：包含参数说明、返回值说明、异常路径和中文注释。
- 补一组对比表：比较不同方案在性能、复杂度、兼容性和维护成本上的差异。
- 补一个排障清单：把 DevTools、日志、测试、监控或安全扫描的操作步骤写成可执行步骤。

## 参考资料

${references.join("\n")}
`
}

/**
 * 收集所有 MDX 文档元数据。
 * @returns {{filePath: string, slug: string, chapterSlug: string, raw: string, parsed: ReturnType<typeof parseDocument>}[]} 文档列表。
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

        docs.push({
          filePath,
          raw,
          parsed,
          chapterSlug: `${volume.name}/${chapter.name}`,
          slug: `${volume.name}/${chapter.name}/${file.name.replace(/\.mdx$/, "")}`,
        })
      }
    }
  }

  return docs
}

/**
 * 主流程：只重构命中模板特征的文章，保留手写深度内容。
 * @returns {void}
 */
function main() {
  const docs = collectDocs()
  let changed = 0

  for (const doc of docs) {
    const { parsed } = doc
    if (!isTemplateBody(parsed.body)) continue

    const profile = profileFor(doc.chapterSlug)
    const frontmatter = updateFrontmatter(parsed.frontmatterText)
    const body = buildBody(
      {
        title: String(parsed.data.title || doc.slug),
        description: String(parsed.data.description || ""),
        chapter: String(parsed.data.chapter || doc.chapterSlug),
        tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
        related: Array.isArray(parsed.data.related) ? parsed.data.related : [],
        crossRefs: Array.isArray(parsed.data.crossRefs) ? parsed.data.crossRefs : [],
      },
      parsed.body,
      profile
    )

    fs.writeFileSync(doc.filePath, `---\n${frontmatter}\n---\n\n${body}`, "utf-8")
    changed++
  }

  console.log(`Reframed ${changed} template MDX files.`)
}

main()
