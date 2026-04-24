const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'content');

const volumes = [
  {
    slug: 'volume-01',
    title: '卷一：计算机科学与网络基础',
    chapters: [
      {
        slug: 'chapter-01',
        title: '第 1 章 计算机系统基础',
        sections: [
          { id: '1.1', slug: '1.1-binary-and-float', title: '数据在计算机中的表示：二进制、十六进制、浮点数（IEEE 754）、大端与小端', tags: ['二进制', '十六进制', 'IEEE754', '字节序', '浮点数精度', '进制转换'] },
          { id: '1.2', slug: '1.2-cpu-cache', title: 'CPU 架构与缓存层次：寄存器、L1/L2/L3 Cache、缓存行、伪共享', tags: ['CPU', '缓存', 'Cache Line', '伪共享', '性能优化'] },
          { id: '1.3', slug: '1.3-memory-management', title: '内存管理：虚拟内存、分页与分段、栈与堆、V8 的堆结构', tags: ['内存管理', '虚拟内存', '堆栈', 'V8', '垃圾回收'] },
          { id: '1.4', slug: '1.4-process-thread', title: '进程与线程：进程间通信（IPC）、线程同步、Web Worker / Service Worker 的进程模型', tags: ['进程', '线程', 'IPC', 'Web Worker', '并发'] },
          { id: '1.5', slug: '1.5-disk-io', title: '磁盘 I/O 与文件系统：同步/异步 I/O、Node.js 的 libuv 事件循环', tags: ['I/O', '文件系统', 'libuv', '异步', 'Node.js'] },
        ]
      },
      {
        slug: 'chapter-02',
        title: '第 2 章 计算机网络协议',
        sections: [
          { id: '2.1', slug: '2.1-osi-tcpip', title: 'OSI 七层模型与 TCP/IP 四层模型对照', tags: ['OSI', 'TCP/IP', '网络模型', '协议'] },
          { id: '2.2', slug: '2.2-tcp', title: 'TCP 协议：三次握手、四次挥手、滑动窗口、拥塞控制、TIME_WAIT、Nagle 算法', tags: ['TCP', '三次握手', '拥塞控制', '滑动窗口'] },
          { id: '2.3', slug: '2.3-udp', title: 'UDP 协议：特点、应用场景、WebRTC 中的 UDP', tags: ['UDP', 'WebRTC', '无连接', '实时通信'] },
          { id: '2.4', slug: '2.4-http-evolution', title: 'HTTP 协议演进：HTTP/0.9 → HTTP/1.0 → HTTP/1.1 → HTTP/2 → HTTP/3', tags: ['HTTP', 'HTTP/2', 'HTTP/3', 'QUIC', '协议演进'] },
          { id: '2.5', slug: '2.5-https-tls', title: 'HTTPS/TLS：对称加密与非对称加密、数字证书、TLS 1.2/1.3 握手', tags: ['HTTPS', 'TLS', 'SSL', '加密', '证书'] },
          { id: '2.6', slug: '2.6-dns', title: 'DNS 解析：递归查询与迭代查询、DNS 记录类型、DNS 缓存、DNS 预解析', tags: ['DNS', '域名解析', 'CDN', '网络优化'] },
          { id: '2.7', slug: '2.7-websocket', title: 'WebSocket 协议：握手过程、帧结构、心跳与重连、与 SSE 的对比', tags: ['WebSocket', 'SSE', '实时通信', '长连接'] },
          { id: '2.8', slug: '2.8-other-protocols', title: '其他协议：IP 协议（IPv4/IPv6）、ICMP、ARP、DHCP、SMTP/POP3/IMAP', tags: ['IP', 'IPv6', 'ICMP', 'ARP', '网络协议'] },
        ]
      },
      {
        slug: 'chapter-03',
        title: '第 3 章 Web 安全基础',
        sections: [
          { id: '3.1', slug: '3.1-sop', title: '同源策略（SOP）：源的定义、限制范围、浏览器的沙箱机制', tags: ['同源策略', 'SOP', 'CORS', '安全'] },
          { id: '3.2', slug: '3.2-csp', title: '内容安全策略（CSP）：指令集、report-uri、nonce / hash、CSP Level 3', tags: ['CSP', 'XSS', '安全策略', '内容安全'] },
          { id: '3.3', slug: '3.3-mixed-content', title: '混合内容（Mixed Content）：主动与被动混合内容、升级不安全请求', tags: ['Mixed Content', 'HTTPS', '安全'] },
          { id: '3.4', slug: '3.4-security-headers', title: '安全头部：HSTS、X-Frame-Options、X-Content-Type-Options、Referrer-Policy、Permissions-Policy、COOP/COEP', tags: ['安全头部', 'HSTS', 'XSS', '点击劫持'] },
        ]
      },
    ]
  },
  {
    slug: 'volume-02',
    title: '卷二：Web 标准与语言规范',
    chapters: [
      {
        slug: 'chapter-04',
        title: '第 4 章 HTML 全景',
        sections: [
          { id: '4.1', slug: '4.1-html-history', title: 'HTML 发展史：HTML 2.0 → XHTML 1.0 → HTML5 → Living Standard（WHATWG）', tags: ['HTML', 'HTML5', 'WHATWG', 'Web标准'] },
          { id: '4.2', slug: '4.2-metadata', title: '文档元数据：DOCTYPE、lang 属性、charset、Viewport Meta、Open Graph / Twitter Cards', tags: ['Meta', 'Viewport', 'SEO', 'Open Graph'] },
          { id: '4.3', slug: '4.3-semantic', title: '语义化标签：article、section、nav、aside、header、footer、main、figure、time、details/summary', tags: ['语义化', 'HTML5', '无障碍', 'SEO'] },
          { id: '4.4', slug: '4.4-forms', title: '表单与交互：表单控件类型、表单验证 API、自定义验证样式、datalist、output', tags: ['表单', 'Form', 'Validation', 'HTML5'] },
          { id: '4.5', slug: '4.5-multimedia', title: '多媒体：video/audio 属性与事件、WebVTT 字幕、picture 与 source、响应式图片', tags: ['多媒体', 'Video', 'Audio', '响应式图片'] },
          { id: '4.6', slug: '4.6-a11y', title: '可访问性（A11y）：WAI-ARIA、屏幕阅读器、键盘导航、色彩对比度、WCAG', tags: ['A11y', 'ARIA', 'WCAG', '无障碍'] },
          { id: '4.7', slug: '4.7-web-components', title: 'Web Components：Custom Elements、Shadow DOM、HTML Templates、Slots', tags: ['Web Components', 'Shadow DOM', 'Custom Elements', '组件化'] },
          { id: '4.8', slug: '4.8-new-html-apis', title: '新兴的 HTML API：Popover API、Dialog 元素、Details 元素动画、Anchor Positioning', tags: ['Popover', 'Dialog', 'Anchor Positioning', '新API'] },
        ]
      },
      {
        slug: 'chapter-05',
        title: '第 5 章 CSS 完全参考',
        sections: [
          { id: '5.1', slug: '5.1-box-model', title: 'CSS 基础模型：盒模型、BFC、包含块、层叠上下文', tags: ['盒模型', 'BFC', '层叠上下文', 'CSS基础'] },
          { id: '5.2', slug: '5.2-selectors', title: '选择器体系：基础选择器、组合器、伪类、伪元素、Specificity、:is/:where/:has', tags: ['选择器', 'Specificity', '伪类', 'CSS'] },
          { id: '5.3', slug: '5.3-values-units', title: '值与单位：绝对单位、相对单位、color、image、CSS 自定义属性', tags: ['CSS单位', '变量', '颜色', '响应式'] },
          { id: '5.4', slug: '5.4-visual-formatting', title: '视觉格式化模型：display、position、float、z-index、overflow', tags: ['Display', 'Position', 'Float', '布局'] },
          { id: '5.5', slug: '5.5-modern-layout', title: '现代布局系统：Flexbox、CSS Grid、多列布局、Subgrid', tags: ['Flexbox', 'Grid', '布局', 'CSS'] },
          { id: '5.6', slug: '5.6-responsive', title: '响应式与自适应设计：媒体查询、容器查询、逻辑属性、clamp/min/max', tags: ['响应式', '媒体查询', '容器查询', 'RWD'] },
          { id: '5.7', slug: '5.7-text-fonts', title: '文本与字体：@font-face、font-display、可变字体、字体子集化、OpenType', tags: ['字体', '@font-face', '可变字体', '排版'] },
          { id: '5.8', slug: '5.8-transform-animation', title: '变换与动画：transform、transition、@keyframes、FLIP、Web Animations API', tags: ['动画', 'Transform', 'Transition', 'WAAPI'] },
          { id: '5.9', slug: '5.9-filter-blend', title: '滤镜与混合模式：filter、backdrop-filter、mix-blend-mode、Mask、Clip-path', tags: ['滤镜', '混合模式', 'CSS特效', '视觉'] },
          { id: '5.10', slug: '5.10-css-architecture', title: 'CSS 架构方法论：OOCSS、BEM、SMACSS、ITCSS、Atomic CSS、CSS Modules、CSS-in-JS', tags: ['BEM', 'Atomic CSS', 'CSS-in-JS', '架构'] },
          { id: '5.11', slug: '5.11-preprocessors', title: 'CSS 预处理器：Sass/SCSS、Less、Stylus', tags: ['Sass', 'SCSS', 'Less', '预处理器'] },
          { id: '5.12', slug: '5.12-css-new-features', title: 'CSS 新特性：:has()、@layer、@scope、@property、Scroll-driven Animations、View Transitions', tags: ['CSS新特性', '@layer', 'View Transitions', '滚动驱动'] },
        ]
      },
      {
        slug: 'chapter-05a',
        title: '第 5-A 章 浏览器兼容性与渐进增强',
        sections: [
          { id: '5a.1', slug: '5a-browser-compat', title: '浏览器兼容性与渐进增强', tags: ['兼容性', '渐进增强', 'Polyfill', 'Baseline'] },
        ]
      },
      {
        slug: 'chapter-06',
        title: '第 6 章 JavaScript 语言精要',
        sections: [
          { id: '6.1', slug: '6.1-js-history', title: 'JS 历史与标准：ES1-6 里程碑、TC39 流程、ES 年度版本、Babel 转译原理', tags: ['ES规范', 'TC39', 'Babel', 'JavaScript'] },
          { id: '6.2', slug: '6.2-type-system', title: '类型系统：原始类型 vs 对象类型、typeof/instanceof、隐式转换、Symbol、BigInt', tags: ['类型系统', 'typeof', 'Symbol', 'BigInt'] },
          { id: '6.3', slug: '6.3-execution-context', title: '执行上下文与作用域：全局/函数/Eval 上下文、作用域链、词法作用域、TDZ', tags: ['执行上下文', '作用域', '闭包', 'TDZ'] },
          { id: '6.4', slug: '6.4-closure', title: '闭包与作用域链：闭包的形成条件、内存泄漏与闭包、模块模式、IIFE', tags: ['闭包', 'IIFE', '模块模式', '内存泄漏'] },
          { id: '6.5', slug: '6.5-this-binding', title: 'this 绑定规则：默认绑定、隐式绑定、显式绑定、new 绑定、箭头函数', tags: ['this', 'bind', 'call', 'apply', '箭头函数'] },
          { id: '6.6', slug: '6.6-prototype', title: '原型与继承：构造函数、prototype、原型链、Object.create、class、私有字段', tags: ['原型', '继承', 'class', 'prototype'] },
          { id: '6.7', slug: '6.7-async', title: '异步编程：回调、Promise/A+、async/await、异步迭代器与生成器', tags: ['Promise', 'async/await', '异步', '事件循环'] },
          { id: '6.8', slug: '6.8-iterator', title: '迭代器协议：可迭代协议、迭代器协议、Generator、yield*', tags: ['迭代器', 'Generator', 'Symbol.iterator', '协议'] },
          { id: '6.9', slug: '6.9-proxy-reflect', title: '反射与代理：Proxy 拦截器、Reflect API、响应式系统实现、Proxy.revocable', tags: ['Proxy', 'Reflect', '响应式', '拦截器'] },
          { id: '6.10', slug: '6.10-error-handling', title: '错误处理：try/catch/finally、Error 类型、自定义错误类、错误监控与 Source Map', tags: ['错误处理', 'try/catch', 'Source Map', '监控'] },
          { id: '6.11', slug: '6.11-regex', title: '正则表达式：模式匹配、捕获组、先行/后行断言、matchAll、Unicode 属性转义', tags: ['正则', 'RegExp', '模式匹配', '断言'] },
          { id: '6.12', slug: '6.12-intl', title: '国际化（Intl）：DateTimeFormat、NumberFormat、RelativeTimeFormat、Segmenter', tags: ['Intl', '国际化', 'i18n', '本地化'] },
          { id: '6.13', slug: '6.13-new-syntax', title: '新语法特性：可选链、空值合并、逻辑赋值、Pipeline Operator、Decorators', tags: ['可选链', '空值合并', 'Decorators', '新语法'] },
        ]
      },
      {
        slug: 'chapter-07',
        title: '第 7 章 TypeScript 全栈指南',
        sections: [
          { id: '7.1', slug: '7.1-ts-basics', title: '类型系统基础：静态类型 vs 动态类型、类型推断、类型断言、unknown vs any、never', tags: ['TypeScript', '类型系统', 'static typing', 'never'] },
          { id: '7.2', slug: '7.2-basic-types', title: '基本类型与复合类型：interface vs type、索引签名、联合类型、交叉类型、元组', tags: ['interface', 'type', '联合类型', '元组'] },
          { id: '7.3', slug: '7.3-advanced-types', title: '高级类型：泛型、条件类型、映射类型、模板字面量类型、infer、递归类型', tags: ['泛型', '条件类型', '映射类型', 'infer'] },
          { id: '7.4', slug: '7.4-type-utils', title: '类型工具：keyof、typeof、内置工具类型全解（Partial/Required/Pick/Omit等）', tags: ['工具类型', 'keyof', 'typeof', '类型体操'] },
          { id: '7.5', slug: '7.5-declarations', title: '类型声明与声明文件：.d.ts、declare、模块声明、DefinitelyTyped', tags: ['声明文件', '.d.ts', 'declare', '类型定义'] },
          { id: '7.6', slug: '7.6-modules', title: '模块与命名空间：ES Module vs CommonJS、moduleResolution、paths、namespace', tags: ['ESM', 'CommonJS', 'moduleResolution', 'namespace'] },
          { id: '7.7', slug: '7.7-type-safety', title: '类型安全实践：品牌类型、穷尽检查、类型谓词、satisfies、noUncheckedIndexedAccess', tags: ['类型安全', '品牌类型', '类型谓词', 'satisfies'] },
          { id: '7.8', slug: '7.8-compiler-api', title: 'TypeScript 编译器 API：tsc 选项、tsconfig.json 全字段解析、AST 遍历、Transformer', tags: ['tsc', 'tsconfig', 'AST', 'Transformer'] },
          { id: '7.9', slug: '7.9-type-gymnastics', title: '类型体操与模式：HKT、类型级编程挑战、类型驱动开发（TDD）', tags: ['类型体操', 'HKT', '类型驱动开发', '挑战'] },
        ]
      },
    ]
  },
  {
    slug: 'volume-03',
    title: '卷三：浏览器与运行时',
    chapters: [
      {
        slug: 'chapter-08',
        title: '第 8 章 浏览器架构与渲染引擎',
        sections: [
          { id: '8.1', slug: '8.1-browser-process', title: '浏览器进程模型：多进程架构、站点隔离、浏览器内核对比', tags: ['浏览器', '多进程', 'Blink', 'WebKit'] },
          { id: '8.2', slug: '8.2-navigation', title: '导航流程：URL 输入到页面显示的全过程', tags: ['导航', 'DNS', 'TCP', 'TLS', '渲染'] },
          { id: '8.3', slug: '8.3-rendering-pipeline', title: '渲染管线深入：解析 HTML、样式计算、布局、绘制、合成', tags: ['渲染管线', 'DOM', 'CSSOM', '合成'] },
          { id: '8.4', slug: '8.4-rasterization', title: '光栅化与显示：软件光栅化 vs GPU 光栅化、Skia、VSync', tags: ['光栅化', 'GPU', 'Skia', 'VSync'] },
          { id: '8.5', slug: '8.5-memory-management', title: '内存管理：V8 堆分区、标记-清除-整理、增量标记、并发标记', tags: ['V8', '内存管理', 'GC', '标记清除'] },
        ]
      },
      {
        slug: 'chapter-09',
        title: '第 9 章 DOM 与 BOM',
        sections: [
          { id: '9.1', slug: '9.1-dom-standard', title: 'DOM 标准与树结构：节点类型、节点关系与遍历、Live Collection 陷阱', tags: ['DOM', '节点', '遍历', 'TreeWalker'] },
          { id: '9.2', slug: '9.2-dom-api', title: 'DOM 操作 API：createElement、insertBefore、现代方法、dataset', tags: ['DOM API', 'createElement', 'dataset', '操作'] },
          { id: '9.3', slug: '9.3-events', title: '事件系统：事件流、事件对象、事件委托、被动事件监听器、事件循环与渲染', tags: ['事件', '事件委托', 'passive', '事件循环'] },
          { id: '9.4', slug: '9.4-viewport', title: '视口与几何：CSS 像素 vs 设备像素、DPR、getBoundingClientRect、IntersectionObserver', tags: ['视口', 'DPR', 'IntersectionObserver', 'ResizeObserver'] },
          { id: '9.5', slug: '9.5-script-loading', title: '脚本执行与解析阻塞：async/defer/module、预加载扫描器、preload/prefetch', tags: ['async', 'defer', 'preload', 'prefetch'] },
          { id: '9.6', slug: '9.6-storage', title: '存储机制：localStorage、IndexedDB、Cache API、OPFS', tags: ['Storage', 'IndexedDB', 'Cache API', 'OPFS'] },
          { id: '9.7', slug: '9.7-network-api', title: '网络请求 API：XMLHttpRequest、fetch、WebSocket、SSE、Beacon API', tags: ['fetch', 'XMLHttpRequest', 'WebSocket', 'SSE'] },
          { id: '9.8', slug: '9.8-file-binary', title: '文件与二进制：File、Blob、ArrayBuffer、TypedArray、DataView、拖放 API', tags: ['File', 'Blob', 'ArrayBuffer', 'TypedArray'] },
          { id: '9.9', slug: '9.9-workers', title: 'Workers：Web Worker、Service Worker、Worklet', tags: ['Web Worker', 'Service Worker', 'Worklet', 'PWA'] },
          { id: '9.10', slug: '9.10-media-api', title: '多媒体 API：Canvas 2D、WebGL/WebGPU、Web Audio、getUserMedia、WebRTC', tags: ['Canvas', 'WebGL', 'WebRTC', 'WebGPU'] },
          { id: '9.11', slug: '9.11-performance-api', title: '性能与观测 API：Performance Timeline、PerformanceObserver、Scheduler API', tags: ['Performance API', 'PerformanceObserver', 'Web Vitals'] },
          { id: '9.12', slug: '9.12-security-api', title: '安全相关 API：Credential Management、WebAuthn、Trusted Types、Permissions API', tags: ['WebAuthn', 'Trusted Types', 'Passkeys', '权限'] },
          { id: '9.13', slug: '9.13-new-web-apis', title: '新兴 Web API：Popover API、View Transitions API、Anchor Positioning API、隐私沙盒', tags: ['Popover', 'View Transitions', '隐私沙盒', '新API'] },
        ]
      },
      {
        slug: 'chapter-10',
        title: '第 10 章 运行时深入',
        sections: [
          { id: '10.1', slug: '10.1-js-engine', title: 'JavaScript 引擎：V8 架构、隐藏类、内联缓存、快速属性与字典模式', tags: ['V8', 'TurboFan', '隐藏类', '内联缓存'] },
          { id: '10.2', slug: '10.2-event-loop', title: '事件循环详解：宏任务队列、微任务队列、process.nextTick、requestAnimationFrame', tags: ['事件循环', '宏任务', '微任务', 'nextTick'] },
          { id: '10.3', slug: '10.3-memory-model', title: '内存模型与垃圾回收：标记-清除-整理、分代回收、WeakMap/WeakRef', tags: ['垃圾回收', '分代回收', 'WeakMap', '内存模型'] },
          { id: '10.4', slug: '10.4-nodejs', title: 'Node.js 运行时：libuv 架构、事件循环阶段、CommonJS、ES Module', tags: ['Node.js', 'libuv', 'CommonJS', 'ESM'] },
          { id: '10.5', slug: '10.5-deno-bun', title: 'Deno 与 Bun：安全模型、原生 TypeScript、Zig 实现、JavaScriptCore', tags: ['Deno', 'Bun', 'Zig', 'JavaScriptCore'] },
        ]
      },
      {
        slug: 'chapter-10a',
        title: '第 10-A 章 浏览器路由与历史管理',
        sections: [
          { id: '10a.1', slug: '10a-router-history', title: '浏览器路由与历史管理', tags: ['History API', '路由', 'bfcache', 'SPA'] },
        ]
      },
    ]
  },
  {
    slug: 'volume-04',
    title: '卷四：框架与状态管理',
    chapters: [
      {
        slug: 'chapter-11',
        title: '第 11 章 React 原理与生态',
        sections: [
          { id: '11.1', slug: '11.1-react-philosophy', title: 'React 设计哲学：声明式 UI、组件化、单向数据流、虚拟 DOM', tags: ['React', '声明式', '虚拟DOM', '组件化'] },
          { id: '11.2', slug: '11.2-jsx', title: 'JSX 与编译：JSX 转换、Babel 插件、@jsx 注释', tags: ['JSX', 'Babel', 'AST', '编译'] },
          { id: '11.3', slug: '11.3-lifecycle', title: '组件生命周期：类组件生命周期图谱、函数组件与 Hooks 的等价映射', tags: ['生命周期', 'Hooks', 'useEffect', '组件'] },
          { id: '11.4', slug: '11.4-hooks', title: 'Hooks 全解：useState、useEffect、useMemo、useCallback、useRef、useReducer', tags: ['Hooks', 'useState', 'useEffect', 'useMemo'] },
          { id: '11.5', slug: '11.5-hooks-rules', title: 'Hooks 规则与原理：Hooks 调用规则、Hooks 链表结构、闭包陷阱', tags: ['Hooks规则', '闭包陷阱', 'memoizedState', '链表'] },
          { id: '11.6', slug: '11.6-rendering', title: 'React 渲染机制：Reconciliation、Diff 算法、Fiber 架构、Render Phase vs Commit Phase', tags: ['Reconciliation', 'Diff', 'Fiber', '渲染'] },
          { id: '11.7', slug: '11.7-concurrent', title: 'React 并发特性：Concurrent Mode、Lane 模型、Time Slicing、Suspense', tags: ['Concurrent Mode', 'Suspense', 'Lane', 'Time Slicing'] },
          { id: '11.8', slug: '11.8-react-18', title: 'React 18 新特性：Automatic Batching、Streaming SSR、useId、useDeferredValue', tags: ['React 18', 'Automatic Batching', 'Streaming SSR', 'useId'] },
          { id: '11.9', slug: '11.9-ssr', title: 'React 服务端渲染：CSR vs SSR vs SSG vs ISR、Next.js、RSC', tags: ['SSR', 'Next.js', 'RSC', 'ISR'] },
          { id: '11.10', slug: '11.10-state-management', title: 'React 状态管理：Context API、Redux、Zustand、Jotai、TanStack Query', tags: ['状态管理', 'Redux', 'Zustand', 'Context'] },
          { id: '11.11', slug: '11.11-react-router', title: 'React Router：v6 新特性、Data API（loader/action/defer）', tags: ['React Router', 'loader', 'Data API', '路由'] },
          { id: '11.12', slug: '11.12-styling', title: 'React 样式方案：CSS Modules、Styled-Components、Emotion、Tailwind CSS', tags: ['CSS Modules', 'Styled-Components', 'Tailwind', '样式'] },
          { id: '11.13', slug: '11.13-forms', title: 'React 表单处理：Formik、React Hook Form、Yup、Zod', tags: ['表单', 'React Hook Form', 'Zod', '验证'] },
          { id: '11.14', slug: '11.14-testing', title: 'React 测试：RTL、Jest/Vitest、MSW、Storybook', tags: ['RTL', 'Jest', 'MSW', 'Storybook'] },
          { id: '11.15', slug: '11.15-source-code', title: 'React 源码导读', tags: ['源码', 'React源码', 'Fiber', 'Scheduler'] },
        ]
      },
      {
        slug: 'chapter-12',
        title: '第 12 章 Vue.js 原理与生态',
        sections: [
          { id: '12.1', slug: '12.1-vue-philosophy', title: 'Vue 设计哲学：渐进式框架、MVVM、响应式系统、模板编译', tags: ['Vue', '渐进式', 'MVVM', '响应式'] },
          { id: '12.2', slug: '12.2-vue2-reactive', title: 'Vue2 响应式原理：Object.defineProperty、Dep/Watcher、数组变异方法', tags: ['Vue2', 'defineProperty', 'Dep', 'Watcher'] },
          { id: '12.3', slug: '12.3-vue3-reactive', title: 'Vue3 响应式原理：Proxy/Reflect、targetMap、ref/reactive/readonly', tags: ['Vue3', 'Proxy', 'ref', 'reactive'] },
          { id: '12.4', slug: '12.4-vue3-compiler', title: 'Vue3 编译器：模板编译流程、静态提升、PatchFlag、Block Tree', tags: ['Vue3编译器', '静态提升', 'PatchFlag', '编译优化'] },
          { id: '12.5', slug: '12.5-composition-api', title: 'Composition API：setup、computed、watch、provide/inject、Composables', tags: ['Composition API', 'setup', 'Composables', '逻辑复用'] },
          { id: '12.6', slug: '12.6-vue-rendering', title: 'Vue 渲染机制：VNode、Diff 算法、异步更新队列、Teleport/Suspense', tags: ['VNode', 'Diff', 'nextTick', 'Teleport'] },
          { id: '12.7', slug: '12.7-directives', title: 'Vue 指令系统：内置指令、自定义指令、v-model 实现', tags: ['指令', 'v-model', '自定义指令', 'Directive'] },
          { id: '12.8', slug: '12.8-sfc', title: 'Vue SFC：<script setup>、<style scoped>、CSS v-bind()、宏', tags: ['SFC', 'script setup', 'scoped', '宏'] },
          { id: '12.9', slug: '12.9-router-state', title: 'Vue 路由与状态管理：Vue Router 4、Pinia、Vuex 4', tags: ['Vue Router', 'Pinia', 'Vuex', '状态管理'] },
          { id: '12.10', slug: '12.10-vue-ssr', title: 'Vue SSR：Nuxt 3、Vite-SSG', tags: ['Nuxt', 'SSR', 'SSG', 'Vite'] },
          { id: '12.11', slug: '12.11-ecosystem', title: 'Vue 生态工具：Volar、Vue DevTools、VueUse', tags: ['Volar', 'DevTools', 'VueUse', '生态'] },
          { id: '12.12', slug: '12.12-migration', title: 'Vue 迁移与对比', tags: ['迁移', 'Vue2', 'Vue3', '对比'] },
        ]
      },
      {
        slug: 'chapter-13',
        title: '第 13 章 Angular 原理与生态',
        sections: [
          { id: '13.1', slug: '13.1-angular-arch', title: 'Angular 架构：NgModule/Standalone Components、依赖注入树', tags: ['Angular', 'NgModule', 'DI', '架构'] },
          { id: '13.2', slug: '13.2-ts-angular', title: 'TypeScript 与 Angular：装饰器、AOT/JIT', tags: ['装饰器', 'AOT', 'JIT', 'TypeScript'] },
          { id: '13.3', slug: '13.3-change-detection', title: '变更检测：Zone.js、Default/OnPush、ChangeDetectorRef、Signals', tags: ['变更检测', 'Zone.js', 'OnPush', 'Signals'] },
          { id: '13.4', slug: '13.4-template', title: '模板语法：插值、绑定、结构指令、属性指令、管道', tags: ['模板', '指令', '管道', '绑定'] },
          { id: '13.5', slug: '13.5-router-forms', title: '路由与表单：Angular Router、Reactive Forms vs Template-driven Forms', tags: ['Router', '表单', 'Reactive Forms', '验证'] },
          { id: '13.6', slug: '13.6-rxjs', title: 'RxJS：Observable/Subject/操作符、Hot vs Cold', tags: ['RxJS', 'Observable', 'Subject', '响应式编程'] },
          { id: '13.7', slug: '13.7-material-cdk', title: 'Angular Material 与 CDK', tags: ['Material', 'CDK', '组件库', 'UI'] },
          { id: '13.8', slug: '13.8-universal', title: 'Angular Universal 与 hydration', tags: ['Universal', 'SSR', 'hydration', 'Angular'] },
        ]
      },
      {
        slug: 'chapter-14',
        title: '第 14 章 新兴框架与范式',
        sections: [
          { id: '14.1', slug: '14.1-svelte', title: 'Svelte / SvelteKit：编译时框架、$derived/$effect、Stores', tags: ['Svelte', '编译时', 'Stores', 'SvelteKit'] },
          { id: '14.2', slug: '14.2-solidjs', title: 'SolidJS：细粒度响应式（Signals）', tags: ['SolidJS', 'Signals', '细粒度', '响应式'] },
          { id: '14.3', slug: '14.3-qwik', title: 'Qwik：可恢复性（Resumability）', tags: ['Qwik', 'Resumability', '可恢复性', '性能'] },
          { id: '14.4', slug: '14.4-astro', title: 'Astro：群岛架构', tags: ['Astro', '群岛架构', 'SSG', ' Islands'] },
          { id: '14.5', slug: '14.5-fresh', title: 'Fresh（Deno）', tags: ['Fresh', 'Deno', '边缘渲染', ' islands'] },
          { id: '14.6', slug: '14.6-remix', title: 'Remix：Web 标准优先', tags: ['Remix', 'Web标准', '嵌套路由', '数据加载'] },
          { id: '14.7', slug: '14.7-framework-comparison', title: '前端框架性能对比', tags: ['性能对比', 'Benchmark', '框架', '评测'] },
        ]
      },
    ]
  },
  {
    slug: 'volume-05',
    title: '卷五：工程化与架构',
    chapters: [
      {
        slug: 'chapter-15',
        title: '第 15 章 构建工具链',
        sections: [
          { id: '15.1', slug: '15.1-package-managers', title: '包管理器：npm/yarn/pnpm、SemVer、workspaces', tags: ['npm', 'pnpm', 'SemVer', 'workspaces'] },
          { id: '15.2', slug: '15.2-webpack', title: 'Webpack：核心概念、Loader/Plugin、Tree Shaking、Code Splitting、Module Federation', tags: ['Webpack', 'Loader', 'Plugin', 'Module Federation'] },
          { id: '15.3', slug: '15.3-vite', title: 'Vite：ESM 开发服务器、esbuild、Rollup 生产构建', tags: ['Vite', 'esbuild', 'ESM', 'Rollup'] },
          { id: '15.4', slug: '15.4-compilers', title: 'esbuild / SWC / tsc / Babel：编译器对比、插件开发', tags: ['esbuild', 'SWC', 'Babel', '编译器'] },
          { id: '15.5', slug: '15.5-rollup', title: 'Rollup：Library 打包', tags: ['Rollup', '打包', 'Library', 'ESM'] },
          { id: '15.6', slug: '15.6-parcel-turbopack', title: 'Parcel / Turbopack', tags: ['Parcel', 'Turbopack', 'Rust', '零配置'] },
          { id: '15.7', slug: '15.7-other-tools', title: '其他工具：Rspack、Farm', tags: ['Rspack', 'Farm', 'Rust', 'Webpack兼容'] },
          { id: '15.8', slug: '15.8-task-runners', title: '任务运行器', tags: ['任务运行器', '脚本', '自动化', '构建'] },
        ]
      },
      {
        slug: 'chapter-15a',
        title: '第 15-A 章 前端库开发与包发布',
        sections: [
          { id: '15a.1', slug: '15a-library-dev', title: '前端库开发与包发布', tags: ['npm包', '发布', 'ESM', 'CJS'] },
        ]
      },
      {
        slug: 'chapter-16',
        title: '第 16 章 代码质量与规范',
        sections: [
          { id: '16.1', slug: '16.1-eslint', title: 'ESLint', tags: ['ESLint', '代码规范', 'Lint', '规则'] },
          { id: '16.2', slug: '16.2-prettier', title: 'Prettier', tags: ['Prettier', '格式化', '代码风格'] },
          { id: '16.3', slug: '16.3-stylelint', title: 'Stylelint', tags: ['Stylelint', 'CSS规范', '样式检查'] },
          { id: '16.4', slug: '16.4-git-hooks', title: 'Git Hooks', tags: ['Git Hooks', 'husky', 'lint-staged', '提交检查'] },
          { id: '16.5', slug: '16.5-type-check', title: '类型检查', tags: ['TypeScript', '类型检查', 'tsc', '类型安全'] },
          { id: '16.6', slug: '16.6-docs', title: '文档与注释', tags: ['文档', '注释', 'JSDoc', 'README'] },
          { id: '16.7', slug: '16.7-code-review', title: '代码审查', tags: ['Code Review', '审查', 'CR', '最佳实践'] },
        ]
      },
      {
        slug: 'chapter-17',
        title: '第 17 章 测试策略',
        sections: [
          { id: '17.1', slug: '17.1-test-pyramid', title: '测试金字塔', tags: ['测试金字塔', '单元测试', '集成测试', 'E2E'] },
          { id: '17.2', slug: '17.2-unit-test', title: '单元测试框架：Jest / Vitest / Mocha', tags: ['Jest', 'Vitest', 'Mocha', '单元测试'] },
          { id: '17.3', slug: '17.3-component-test', title: '前端组件测试：RTL / Vue Test Utils', tags: ['RTL', '组件测试', 'Vue Test Utils', '渲染'] },
          { id: '17.4', slug: '17.4-e2e', title: 'E2E 测试：Playwright / Cypress / Selenium', tags: ['Playwright', 'Cypress', 'E2E', '自动化测试'] },
          { id: '17.5', slug: '17.5-visual-test', title: '可视化测试：Storybook / Chromatic', tags: ['Storybook', 'Chromatic', '视觉回归', '组件文档'] },
          { id: '17.6', slug: '17.6-mock', title: 'Mock 与存根：MSW / json-server', tags: ['MSW', 'Mock', 'API Mock', '测试'] },
          { id: '17.7', slug: '17.7-coverage', title: '覆盖率、Flaky Test 治理、测试隔离', tags: ['覆盖率', 'Flaky Test', '测试隔离', '稳定性'] },
          { id: '17.8', slug: '17.8-tdd-bdd', title: 'TDD 与 BDD', tags: ['TDD', 'BDD', '测试驱动开发', '行为驱动'] },
          { id: '17.9', slug: '17.9-a11y-test', title: 'Accessibility Testing：axe-core、自动化可访问性测试', tags: ['axe-core', 'a11y测试', '无障碍', '自动化'] },
          { id: '17.10', slug: '17.10-perf-test', title: 'Performance Testing：Lighthouse CI、性能回归检测', tags: ['Lighthouse CI', '性能测试', '回归', 'CI'] },
          { id: '17.11', slug: '17.11-contract-test', title: 'Contract Testing：OpenAPI / GraphQL Schema 契约校验', tags: ['契约测试', 'OpenAPI', 'GraphQL', 'Schema'] },
        ]
      },
      {
        slug: 'chapter-18',
        title: '第 18 章 前端架构设计',
        sections: [
          { id: '18.1', slug: '18.1-layered-arch', title: '分层架构：MVC / MVP / MVVM / Clean Architecture', tags: ['MVC', 'MVVM', 'Clean Architecture', '分层'] },
          { id: '18.2', slug: '18.2-component-design', title: '组件设计原则', tags: ['组件设计', '原子设计', '设计原则', '复用'] },
          { id: '18.3', slug: '18.3-design-patterns', title: '设计模式在前端', tags: ['设计模式', '单例', '观察者', '工厂模式'] },
          { id: '18.4', slug: '18.4-state-arch', title: '状态管理架构：XState / CQRS / Event Sourcing', tags: ['XState', 'CQRS', 'Event Sourcing', '状态机'] },
          { id: '18.5', slug: '18.5-micro-frontends', title: '微前端架构：iframe / Web Components / Module Federation / qiankun', tags: ['微前端', 'Module Federation', 'qiankun', 'single-spa'] },
          { id: '18.6', slug: '18.6-monorepo', title: 'Monorepo 管理：Nx / Turborepo / Changesets', tags: ['Monorepo', 'Nx', 'Turborepo', 'Changesets'] },
          { id: '18.7', slug: '18.7-component-lib', title: '组件库设计', tags: ['组件库', '设计系统', 'UI库', '封装'] },
          { id: '18.8', slug: '18.8-low-code', title: '低代码 / 无代码', tags: ['低代码', '无代码', 'Low Code', '可视化'] },
        ]
      },
      {
        slug: 'chapter-18a',
        title: '第 18-A 章 现代 Web 渲染架构',
        sections: [
          { id: '18a.1', slug: '18a-rendering-arch', title: '现代 Web 渲染架构', tags: ['CSR', 'SSR', 'SSG', 'ISR', 'Streaming'] },
        ]
      },
      {
        slug: 'chapter-19',
        title: '第 19 章 设计系统与 UI 工程',
        sections: [
          { id: '19.1', slug: '19.1-design-tokens', title: 'Design Tokens（W3C 标准）', tags: ['Design Tokens', 'W3C', '设计变量', '主题'] },
          { id: '19.2', slug: '19.2-css-arch', title: 'CSS 架构：ITCSS / CUBE CSS / Utility-First', tags: ['ITCSS', 'CUBE CSS', 'Utility-First', 'CSS架构'] },
          { id: '19.3', slug: '19.3-component-lib-impl', title: '组件库实现', tags: ['组件库', '实现', '封装', '设计系统'] },
          { id: '19.4', slug: '19.4-icon-system', title: '图标系统', tags: ['图标', 'Icon', 'SVG', '字体图标'] },
          { id: '19.5', slug: '19.5-dark-mode', title: '暗黑模式与主题切换', tags: ['暗黑模式', '主题', 'Dark Mode', 'prefers-color-scheme'] },
          { id: '19.6', slug: '19.6-responsive', title: '响应式设计', tags: ['响应式', 'RWD', '自适应', '断点'] },
          { id: '19.7', slug: '19.7-design-to-code', title: '设计稿到代码：Figma Tokens、组件 API、设计治理', tags: ['Figma', '设计稿', 'D2C', '设计治理'] },
        ]
      },
      {
        slug: 'chapter-19a',
        title: '第 19-A 章 编译原理与前端工具链实现',
        sections: [
          { id: '19a.1', slug: '19a-compiler-principles', title: '编译原理与前端工具链实现', tags: ['AST', 'Babel', '编译器', '工具链'] },
        ]
      },
    ]
  },
  {
    slug: 'volume-06',
    title: '卷六：性能优化与可观测性',
    chapters: [
      {
        slug: 'chapter-20',
        title: '第 20 章 Web 性能指标体系',
        sections: [
          { id: '20.1', slug: '20.1-rail', title: 'RAIL 模型', tags: ['RAIL', '性能模型', '响应', '动画'] },
          { id: '20.2', slug: '20.2-core-web-vitals', title: 'Core Web Vitals：LCP / FID / CLS / INP', tags: ['Core Web Vitals', 'LCP', 'CLS', 'INP'] },
          { id: '20.3', slug: '20.3-other-metrics', title: '其他关键指标：FCP / TTFB / TBT / TTI / SI', tags: ['FCP', 'TTFB', 'TTI', '性能指标'] },
          { id: '20.4', slug: '20.4-lighthouse', title: '性能评分工具：Lighthouse / PageSpeed Insights / WebPageTest', tags: ['Lighthouse', 'PageSpeed', 'WebPageTest', '评分'] },
        ]
      },
      {
        slug: 'chapter-21',
        title: '第 21 章 加载性能优化',
        sections: [
          { id: '21.1', slug: '21.1-resource-priority', title: '资源优先级：preload / prefetch / preconnect', tags: ['preload', 'prefetch', 'preconnect', '资源优先级'] },
          { id: '21.2', slug: '21.2-code-optimization', title: '代码优化：Tree Shaking / Code Splitting', tags: ['Tree Shaking', 'Code Splitting', '懒加载', '优化'] },
          { id: '21.3', slug: '21.3-image-optimization', title: '图片优化：WebP / AVIF / srcset', tags: ['WebP', 'AVIF', 'srcset', '图片优化'] },
          { id: '21.4', slug: '21.4-font-optimization', title: '字体优化：font-display / 子集化 / Variable Fonts', tags: ['font-display', '字体子集化', 'Variable Fonts', 'FOIT'] },
          { id: '21.5', slug: '21.5-network-optimization', title: '网络优化：HTTP/3 / CDN / Brotli', tags: ['HTTP/3', 'CDN', 'Brotli', '压缩'] },
          { id: '21.6', slug: '21.6-caching', title: '缓存策略', tags: ['缓存', 'Cache', 'Service Worker', 'PWA'] },
          { id: '21.7', slug: '21.7-rendering-modes', title: '渲染模式：CSR / SSR / SSG / ISR / Streaming SSR', tags: ['CSR', 'SSR', 'SSG', 'ISR', 'Streaming'] },
        ]
      },
      {
        slug: 'chapter-22',
        title: '第 22 章 运行时性能优化',
        sections: [
          { id: '22.1', slug: '22.1-rendering-optimization', title: '渲染优化：减少回流重绘、分层、合成友好动画', tags: ['回流', '重绘', '合成', 'will-change'] },
          { id: '22.2', slug: '22.2-js-optimization', title: 'JavaScript 执行优化：任务切分、主线程让步、避免长任务', tags: ['长任务', '任务切分', 'scheduler', '主线程'] },
          { id: '22.3', slug: '22.3-memory-optimization', title: '内存优化：对象生命周期、缓存失控、泄漏定位', tags: ['内存优化', '泄漏', '生命周期', 'DevTools'] },
          { id: '22.4', slug: '22.4-animation-perf', title: '动画性能：60fps / 120fps、VSync、输入响应性', tags: ['60fps', 'VSync', 'requestAnimationFrame', '动画'] },
        ]
      },
      {
        slug: 'chapter-23',
        title: '第 23 章 监控与可观测性',
        sections: [
          { id: '23.1', slug: '23.1-rum', title: 'RUM：PerformanceObserver / Web Vitals 库', tags: ['RUM', 'PerformanceObserver', '真实用户监控'] },
          { id: '23.2', slug: '23.2-error-monitoring', title: '错误监控：Sentry / Source Map', tags: ['Sentry', '错误监控', 'Source Map', '异常'] },
          { id: '23.3', slug: '23.3-logging', title: '日志系统', tags: ['日志', 'Log', '结构化日志', '埋点'] },
          { id: '23.4', slug: '23.4-tracing', title: '链路追踪：OpenTelemetry', tags: ['OpenTelemetry', '链路追踪', '分布式追踪', '可观测性'] },
          { id: '23.5', slug: '23.5-perf-budget', title: '性能预算', tags: ['性能预算', '预算', '体积控制', '监控'] },
          { id: '23.6', slug: '23.6-ux-analysis', title: '用户体验分析', tags: ['UX', '用户体验', '分析', '热力图'] },
        ]
      },
    ]
  },
  {
    slug: 'volume-07',
    title: '卷七：安全与合规',
    chapters: [
      {
        slug: 'chapter-24',
        title: '第 24 章 Web 安全攻防',
        sections: [
          { id: '24.1', slug: '24.1-xss', title: 'XSS：反射型 / 存储型 / DOM 型', tags: ['XSS', '反射型', '存储型', 'DOM型'] },
          { id: '24.2', slug: '24.2-csrf', title: 'CSRF', tags: ['CSRF', '跨站请求伪造', 'Token', '防护'] },
          { id: '24.3', slug: '24.3-clickjacking', title: '点击劫持', tags: ['点击劫持', 'X-Frame-Options', 'CSP', 'UI Redressing'] },
          { id: '24.4', slug: '24.4-mitm', title: '中间人攻击（MITM）', tags: ['MITM', '中间人', 'HTTPS', 'HSTS'] },
          { id: '24.5', slug: '24.5-injection', title: '注入攻击', tags: ['注入', 'SQL注入', '命令注入', 'XSS'] },
          { id: '24.6', slug: '24.6-deserialization', title: '不安全的反序列化', tags: ['反序列化', '安全', 'JSON', 'RCE'] },
          { id: '24.7', slug: '24.7-data-leak', title: '敏感数据泄露', tags: ['数据泄露', '敏感信息', '加密', '保护'] },
          { id: '24.8', slug: '24.8-supply-chain', title: '供应链安全', tags: ['供应链', 'npm', '依赖', '安全'] },
          { id: '24.9', slug: '24.9-spectre', title: '新兴威胁：Spectre / XS-Leaks', tags: ['Spectre', 'XS-Leaks', '侧信道', '安全'] },
        ]
      },
      {
        slug: 'chapter-25',
        title: '第 25 章 身份认证与授权',
        sections: [
          { id: '25.1', slug: '25.1-session', title: '会话管理', tags: ['Session', 'Cookie', '会话', '安全'] },
          { id: '25.2', slug: '25.2-oauth', title: 'OAuth 2.0 / OpenID Connect', tags: ['OAuth', 'OpenID', '认证', '授权'] },
          { id: '25.3', slug: '25.3-sso', title: '单点登录（SSO）', tags: ['SSO', '单点登录', 'SAML', '统一认证'] },
          { id: '25.4', slug: '25.4-webauthn', title: '无密码认证：WebAuthn / Passkeys', tags: ['WebAuthn', 'Passkeys', '无密码', '生物识别'] },
          { id: '25.5', slug: '25.5-mfa', title: '多因素认证（MFA）', tags: ['MFA', '多因素', '2FA', 'OTP'] },
          { id: '25.6', slug: '25.6-security-best-practices', title: '前端安全最佳实践', tags: ['安全最佳实践', 'CSP', 'HTTPS', 'HSTS'] },
        ]
      },
      {
        slug: 'chapter-25a',
        title: '第 25-A 章 Web Crypto API 与前端密码学',
        sections: [
          { id: '25a.1', slug: '25a-web-crypto', title: 'Web Crypto API 与前端密码学', tags: ['Web Crypto', 'AES', 'RSA', '加密'] },
        ]
      },
      {
        slug: 'chapter-25b',
        title: '第 25-B 章 隐私合规与数据治理',
        sections: [
          { id: '25b.1', slug: '25b-privacy-compliance', title: '隐私合规与数据治理', tags: ['GDPR', '隐私', '合规', '数据治理'] },
        ]
      },
    ]
  },
  {
    slug: 'volume-08',
    title: '卷八：全栈与跨端',
    chapters: [
      {
        slug: 'chapter-26',
        title: '第 26 章 Node.js 服务端开发',
        sections: [
          { id: '26.1', slug: '26.1-node-core', title: 'Node.js 核心模块', tags: ['Node.js', '核心模块', 'fs', 'http'] },
          { id: '26.2', slug: '26.2-async-patterns', title: '异步编程模式', tags: ['异步', 'Promise', 'async/await', '回调'] },
          { id: '26.3', slug: '26.3-web-frameworks', title: 'Web 框架：Express / Koa / Fastify / NestJS', tags: ['Express', 'Koa', 'Fastify', 'NestJS'] },
          { id: '26.4', slug: '26.4-database', title: '数据库交互', tags: ['数据库', 'ORM', 'SQL', 'NoSQL'] },
          { id: '26.5', slug: '26.5-api-design', title: 'API 设计：REST / GraphQL / gRPC-Web / TRPC', tags: ['REST', 'GraphQL', 'gRPC', 'TRPC'] },
          { id: '26.6', slug: '26.6-realtime', title: '实时通信', tags: ['WebSocket', 'SSE', 'Socket.io', '实时'] },
          { id: '26.7', slug: '26.7-auth-middleware', title: '身份验证中间件', tags: ['中间件', 'JWT', '认证', '授权'] },
          { id: '26.8', slug: '26.8-file-upload', title: '文件上传与存储', tags: ['文件上传', 'OSS', '存储', '流'] },
          { id: '26.9', slug: '26.9-ssr-frameworks', title: 'SSR 框架', tags: ['Next.js', 'Nuxt', 'Remix', 'SSR'] },
          { id: '26.10', slug: '26.10-serverless', title: 'Serverless 与边缘计算', tags: ['Serverless', '边缘计算', 'Vercel', 'Cloudflare'] },
          { id: '26.11', slug: '26.11-bff-cache', title: 'BFF、缓存分层与前后端边界', tags: ['BFF', '缓存', '前后端', '边界'] },
        ]
      },
      {
        slug: 'chapter-27',
        title: '第 27 章 跨端开发',
        sections: [
          { id: '27.1', slug: '27.1-mobile-web', title: '移动端 Web', tags: ['移动端', 'H5', '适配', 'viewport'] },
          { id: '27.2', slug: '27.2-mini-program', title: '小程序开发：微信 / Taro / UniApp', tags: ['小程序', 'Taro', 'UniApp', '跨端'] },
          { id: '27.3', slug: '27.3-cross-platform', title: '跨平台原生应用：React Native / Flutter', tags: ['React Native', 'Flutter', '原生', '跨平台'] },
          { id: '27.4', slug: '27.4-desktop', title: '桌面端应用：Electron / Tauri', tags: ['Electron', 'Tauri', '桌面端', 'Rust'] },
          { id: '27.5', slug: '27.5-webassembly', title: 'WebAssembly（Wasm）', tags: ['WebAssembly', 'Wasm', 'Rust', 'C++'] },
        ]
      },
      {
        slug: 'chapter-28',
        title: '第 28 章 可视化与图形编程',
        sections: [
          { id: '28.1', slug: '28.1-canvas', title: 'Canvas 2D', tags: ['Canvas', '2D', '绘图', '像素'] },
          { id: '28.2', slug: '28.2-svg', title: 'SVG', tags: ['SVG', '矢量图', '动画', '可缩放'] },
          { id: '28.3', slug: '28.3-webgl', title: 'WebGL / WebGL2 / WebGPU / Three.js', tags: ['WebGL', 'WebGPU', 'Three.js', '3D'] },
          { id: '28.4', slug: '28.4-webgpu-compute', title: 'WebGPU 计算管线', tags: ['WebGPU', '计算着色器', 'GPU', '并行计算'] },
          { id: '28.5', slug: '28.5-data-viz', title: '数据可视化：D3.js / ECharts / AntV', tags: ['D3.js', 'ECharts', 'AntV', '可视化'] },
          { id: '28.6', slug: '28.6-maps', title: '地图与位置服务', tags: ['地图', 'GIS', '位置服务', 'LBS'] },
        ]
      },
      {
        slug: 'chapter-28a',
        title: '第 28-A 章 实时音视频与流媒体',
        sections: [
          { id: '28a.1', slug: '28a-streaming-media', title: '实时音视频与流媒体', tags: ['HLS', 'DASH', 'WebRTC', '流媒体'] },
        ]
      },
    ]
  },
];

function generateSkeleton(section) {
  const tagsStr = section.tags.map(t => `"${t}"`).join(', ');
  return `---
title: "${section.id} ${section.title}"
description: "${section.title.split('：')[1] || section.title}"
volume: "${section.volume || ''}"
chapter: "${section.chapter || ''}"
section: "${section.id}"
tags: [${tagsStr}]
difficulty: "基础"
prerequisites: []
related: []
crossRefs: []
lastUpdated: "2026-04-24"
---

## 原理

内容待补充...

## 用法

内容待补充...

## 实践

内容待补充...

## 陷阱

内容待补充...
`;
}

let total = 0;

volumes.forEach(volume => {
  volume.chapters.forEach(chapter => {
    chapter.sections.forEach(section => {
      section.volume = volume.title;
      section.chapter = chapter.title;
      const filePath = path.join(baseDir, volume.slug, chapter.slug, `${section.slug}.mdx`);
      const content = generateSkeleton(section);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
      total++;
    });
  });
});

console.log(`Generated ${total} MDX skeleton files`);
