# 前端开发百科全书

> 涵盖从计算机底层到浏览器、从语言规范到框架源码、从工程化到架构设计、从性能安全到跨端全栈的完整前端知识体系。

[在线访问](https://fddlpz.github.io/fe-encyclopedia/) · [问题反馈](https://github.com/fddlpz/fe-encyclopedia/issues)

---

## 简介

本项目是一部真正意义上的前端百科全书，基于 Next.js + MDX 构建，支持全文搜索、知识关联图谱、前后置依赖链、标签化推荐等知识扩散功能。

全书共 **8 卷、28+ 章、231 小节**，每小节按更偏工程决策的框架组织：

- **章节定位**：说明本节要解决的真实问题、学习目标和能力边界
- **知识地图**：把主题放回章节链路，建立机制、约束和关联阅读路径
- **核心机制**：按“术语 -> 机制 -> 证据”拆解关键概念
- **工程决策**：用场景、约束、验证方式和回退方案支持选型
- **实战路径**：给出可落地的推进步骤、代码示例和维护责任
- **诊断与验证**：沉淀排障动作、观察指标和完成证据
- **常见误区与补写清单**：明确反模式，并为后续深写预留结构

---

## 内容体系

| 卷 | 主题 | 章节数 | 状态 |
|---|---|---|---|
| 卷一 | 计算机科学与网络基础 | 3 章 | 核心内容已填充 |
| 卷二 | Web 标准与语言规范 | 4 章 | 核心内容已填充 |
| 卷三 | 浏览器与运行时 | 3 章 | 骨架已创建 |
| 卷四 | 框架与状态管理 | 4 章 | 核心内容已填充 |
| 卷五 | 工程化与架构 | 8 章 | 骨架已创建 |
| 卷六 | 性能优化与可观测性 | 4 章 | 核心内容已填充 |
| 卷七 | 安全与合规 | 4 章 | 骨架已创建 |
| 卷八 | 全栈与跨端 | 4 章 | 骨架已创建 |

> **核心内容**：第 1 章（计算机基础）、第 6 章（JavaScript 精要）、第 11 章（React 原理）、第 20-22 章（性能优化）已填充完整内容。其余章节保留结构化骨架，可逐步补充。

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | [Next.js 14](https://nextjs.org/) (App Router, SSG) |
| 内容 | [MDX](https://mdxjs.com/) + [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) + [gray-matter](https://github.com/jonschlinkert/gray-matter) |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) + [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) |
| 组件 | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| 搜索 | [flexsearch](https://github.com/nextapps-de/flexsearch) 客户端全文索引 |
| 图标 | [Lucide React](https://lucide.dev/) |
| 部署 | [GitHub Pages](https://pages.github.com/) + GitHub Actions |

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/fddlpz/fe-encyclopedia.git
cd fe-encyclopedia

# 安装依赖
npm install

# 生成搜索索引
npm run generate-index

# 检查 231 篇文章是否符合 V2 内容结构
npm run check-content

# 可选：批量迁移文章到 V2 结构
npm run migrate-content-v2

# 可选：重构仍带模板痕迹的章节内容框架
npm run reframe-content

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000/fe-encyclopedia/ 查看。

---

## 构建与部署

```bash
# 生成搜索索引、检查内容结构并构建静态站点
npm run generate-index
npm run check-content
npm run build

# 构建输出位于 dist/ 目录
```

部署由 GitHub Actions 自动处理。推送代码到 `main` 分支后，Actions 会自动构建并部署到 GitHub Pages。

---

## 知识扩散功能

本项目不仅是静态文档，还内置了三层知识扩散系统：

1. **关联章节网络图**：每篇文章底部展示与当前知识点相关的力导向图，支持点击跳转
2. **前后置依赖链**：明确标注学习当前知识的前置要求和后续延伸方向
3. **标签化推荐系统**：基于标签相似度自动推荐相关文章

---

## 目录结构

```
fe-encyclopedia/
├── app/                    # Next.js App Router
│   ├── (docs)/             # 文档页面布局
│   │   ├── [...slug]/      # MDX 动态路由
│   │   └── layout.tsx      # 文档三栏布局
│   ├── page.tsx            # 首页
│   └── layout.tsx          # 根布局
├── components/
│   ├── layout/             # 布局组件（侧边栏、搜索、目录等）
│   ├── content/            # 内容组件（代码块、知识图谱、Quiz 等）
│   └── home/               # 首页组件
├── content/                # 所有 MDX 内容（按卷/章/节组织）
│   ├── volume-01/          # 卷一
│   ├── volume-02/          # 卷二
│   └── ...
├── lib/                    # 工具库（MDX 编译、导航生成、搜索索引）
├── scripts/
│   ├── generate-index.ts              # 搜索索引生成脚本
│   ├── check-content-structure.ts     # V2 内容结构检查脚本
│   └── migrate-content-v2.js          # V2 内容结构迁移脚本
└── .github/workflows/
    └── deploy.yml          # GitHub Pages 自动部署
```

---

## 如何贡献内容

内容使用 MDX 格式，位于 `content/` 目录下。每篇文章需遵循 V2 frontmatter 格式：

```yaml
---
title: "1.1 数据在计算机中的表示：二进制、十六进制、浮点数（IEEE 754）、大端与小端"
description: "深入理解计算机底层数据表示方式，以及它们对网络通信、文件格式和前端二进制处理的影响。"
volume: "卷一：计算机科学与网络基础"
chapter: "第 1 章 计算机系统基础"
section: "1.1"
status: "已完成"
difficulty: "基础"
lastUpdated: "2026-06-26"
tags: ["二进制", "IEEE754", "字节序", "进制转换"]
keywords: ["Binary", "IEEE 754", "Endian", "ArrayBuffer"]
summary: "本文解释二进制、浮点数和字节序的底层机制，并说明它们在前端二进制协议和数据处理中的工程影响。"
learningGoals:
  - "理解二进制、补码、IEEE 754 和字节序的核心概念。"
  - "掌握前端处理 ArrayBuffer、TypedArray 和 DataView 时的验证方式。"
  - "能够识别浮点数精度、大整数和字节序相关的常见误区。"
prerequisites: []
related:
  - title: "1.2 CPU 架构与缓存层次"
    slug: "volume-01/chapter-01/1.2-cpu-cache"
crossRefs:
  - title: "9.8 文件与二进制"
    slug: "volume-03/chapter-09/9.8-file-binary"
references:
  - title: "MDN JavaScript Typed Arrays"
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays"
---
```

文章正文统一使用以下二级标题：

```mdx
## 速览
## 背景与问题
## 核心概念
## 工作原理
## 代码示例
## 工程实践
## 常见误区
## 对比总结
## 自测题
## 参考资料
```

新增或修改内容后建议依次运行：

```bash
npm run migrate-content-v2
npm run generate-index
npm run check-content
npm run build
```

---

## 致谢

- 内容结构参考《前端开发百科全书》完整提纲
- 样式方案基于 [shadcn/ui](https://ui.shadcn.com/)
- 代码高亮由 [Shiki](https://shiki.style/) 提供

---

## License

MIT
