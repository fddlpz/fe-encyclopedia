const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require("remark-gfm")],
    rehypePlugins: [
      require("rehype-slug"),
      [require("rehype-pretty-code"), {
        theme: "github-dark",
        keepBackground: false,
      }],
    ],
  },
})

/**
 * GitHub Pages 部署配置说明：
 * - 如果使用用户/组织站点（username.github.io），basePath 保持为空字符串 ""
 * - 如果使用项目站点（username.github.io/repo-name），basePath 设为 "/repo-name"
 * - 当前默认使用项目站点配置，如需修改请调整下方 basePath
 */
const repoName = "fe-encyclopedia" // 修改为你的仓库名
const isProduction = process.env.NODE_ENV === "production"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 仅生产构建使用静态导出；开发模式保留 Next 默认资源服务，避免 catch-all 路由吞掉 _next 静态资源。
  ...(isProduction ? { output: "export" } : {}),
  // 开发模式使用默认 .next 目录，避免和静态导出的 dist 目录冲突。
  distDir: isProduction ? "dist" : ".next",
  basePath: isProduction ? `/${repoName}` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProduction ? `/${repoName}` : "",
  },
  images: {
    unoptimized: true,
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
}

module.exports = withMDX(nextConfig)
