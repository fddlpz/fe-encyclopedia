import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { type VolumeNode, type ChapterNode, type SectionNode } from "@/types"

const contentDirectory = path.join(process.cwd(), "content")

export function getNavigationTree(): VolumeNode[] {
  const volumes: VolumeNode[] = []

  if (!fs.existsSync(contentDirectory)) return volumes

  const volumeDirs = fs
    .readdirSync(contentDirectory, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  for (const volDir of volumeDirs) {
    const volPath = path.join(contentDirectory, volDir.name)
    const chapters: ChapterNode[] = []

    const chapterDirs = fs
      .readdirSync(volPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

    for (const chapDir of chapterDirs) {
      const chapPath = path.join(volPath, chapDir.name)
      const sections: SectionNode[] = []

      const files = fs
        .readdirSync(chapPath, { withFileTypes: true })
        .filter((f) => f.isFile() && f.name.endsWith(".mdx"))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

      for (const file of files) {
        const filePath = path.join(chapPath, file.name)
        const raw = fs.readFileSync(filePath, "utf-8")
        const { data } = matter(raw)
        const slug = `${volDir.name}/${chapDir.name}/${file.name.replace(/\.mdx$/, "")}`
        sections.push({
          title: data.title || file.name.replace(/\.mdx$/, ""),
          slug,
          section: data.section || "",
        })
      }

      // Extract chapter title from first section's volume+chapter metadata
      let chapterTitle = chapDir.name
      if (sections.length > 0) {
        const firstFile = fs
          .readdirSync(chapPath)
          .filter((f) => f.endsWith(".mdx"))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))[0]
        if (firstFile) {
          const raw = fs.readFileSync(path.join(chapPath, firstFile), "utf-8")
          const { data } = matter(raw)
          chapterTitle = data.chapter || chapDir.name
        }
      }

      chapters.push({
        title: chapterTitle,
        slug: `${volDir.name}/${chapDir.name}`,
        sections,
      })
    }

    // Extract volume title from first section's volume metadata
    let volumeTitle = volDir.name
    let volumeDescription = ""
    if (chapters.length > 0 && chapters[0].sections.length > 0) {
      const firstSectionPath = path.join(
        volPath,
        fs.readdirSync(volPath, { withFileTypes: true }).filter((d) => d.isDirectory())[0]?.name || "",
        fs
          .readdirSync(
            path.join(
              volPath,
              fs.readdirSync(volPath, { withFileTypes: true }).filter((d) => d.isDirectory())[0]?.name || ""
            )
          )
          .filter((f) => f.endsWith(".mdx"))[0] || ""
      )
      if (fs.existsSync(firstSectionPath)) {
        const raw = fs.readFileSync(firstSectionPath, "utf-8")
        const { data } = matter(raw)
        volumeTitle = data.volume || volDir.name
        volumeDescription = data.description || ""
      }
    }

    volumes.push({
      title: volumeTitle,
      slug: volDir.name,
      description: volumeDescription,
      chapters,
    })
  }

  return volumes
}

export function getVolumeInfo(): { slug: string; title: string; description: string }[] {
  const tree = getNavigationTree()
  return tree.map((v) => ({
    slug: v.slug,
    title: v.title,
    description: v.description,
  }))
}
