# 前端开发百科全书

> 涵盖从计算机底层到浏览器、从语言规范到框架源码、从工程化到架构设计、从性能安全到跨端全栈的完整前端知识体系。

[在线访问](https://fddlpz.github.io/fe-encyclopedia/) · [问题反馈](https://github.com/fddlpz/fe-encyclopedia/issues)

---

## 简介

本项目是一部真正意义上的前端百科全书，基于 Next.js + MDX 构建，支持全文搜索、知识关联图谱、前后置依赖链、标签化推荐等知识扩散功能。

全书共 **8 卷、28+ 章、231 小节**，每小节按统一格式组织：

- **原理**：核心概念、设计背景与形式化定义
- **用法**：API / 语法 / 配置详解与最小示例
- **实践**：真实业务场景、权衡与最佳实践
- **陷阱**：常见错误、调试手段与兼容性注意

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

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000/fe-encyclopedia/ 查看。

---

## 构建与部署

```bash
# 生成搜索索引并构建静态站点
npm run generate-index
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
│   └── generate-index.ts   # 搜索索引生成脚本
└── .github/workflows/
    └── deploy.yml          # GitHub Pages 自动部署
```

---

## 如何贡献内容

内容使用 MDX 格式，位于 `content/` 目录下。每篇文章需遵循以下 frontmatter 格式：

```yaml
---
title: "1.1 数据在计算机中的表示"
description: "二进制、十六进制、浮点数（IEEE 754）、大端与小端"
volume: "卷一：计算机科学与网络基础"
chapter: "第 1 章 计算机系统基础"
section: "1.1"
tags: ["二进制", "IEEE754", "字节序", "进制转换"]
difficulty: "基础"
prerequisites: []
related: []
crossRefs: []
lastUpdated: "2026-04-24"
---
```

文章正文按四部分组织：原理、用法、实践、陷阱。

---

## 致谢

- 内容结构参考《前端开发百科全书》完整提纲
- 样式方案基于 [shadcn/ui](https://ui.shadcn.com/)
- 代码高亮由 [Shiki](https://shiki.style/) 提供

---

## License

MIT
