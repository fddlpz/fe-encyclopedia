const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require("remark-gfm")],
    rehypePlugins: [
      require("rehype-slug"),
      [require("rehype-pretty-code"), {
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  basePath: process.env.NODE_ENV === "production" ? `/${repoName}` : "",
  images: {
    unoptimized: true,
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
}

module.exports = withMDX(nextConfig)
