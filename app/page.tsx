import React from "react"
import Link from "next/link"
import { BookOpen, Github, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VolumeCard } from "@/components/home/volume-card"
import { getNavigationTree } from "@/lib/navigation"

export default function HomePage() {
  const volumes = getNavigationTree()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5" />
            前端开发百科全书
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/volume-01/chapter-01/1.1-binary-and-float">
                <Search className="mr-1 h-4 w-4" />
                开始阅读
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              前端开发百科全书
            </h1>
            <p className="mb-2 text-lg text-muted-foreground">
              从比特到浏览器，从语言规范到框架源码
            </p>
            <p className="mb-8 text-muted-foreground">
              涵盖计算机底层、Web标准、浏览器原理、框架生态、工程化、性能优化、安全合规、跨端全栈的完整知识体系
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/volume-01/chapter-01/1.1-binary-and-float">
                  开始阅读
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Volumes Grid */}
        <section className="container pb-16">
          <h2 className="mb-8 text-2xl font-bold">八大卷目录</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {volumes.map((volume, index) => (
              <VolumeCard
                key={volume.slug}
                number={index + 1}
                title={volume.title}
                description={volume.description || "暂无描述"}
                slug={volume.chapters[0]?.sections[0]?.slug || volume.slug}
                chapterCount={volume.chapters.length}
              />
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="border-t bg-muted/50">
          <div className="container py-12">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{volumes.length}</p>
                <p className="text-sm text-muted-foreground">卷</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {volumes.reduce((acc, v) => acc + v.chapters.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">章</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {volumes.reduce((acc, v) => acc + v.chapters.reduce((a, c) => a + c.sections.length, 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">小节</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">∞</p>
                <p className="text-sm text-muted-foreground">知识关联</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>前端开发百科全书 · 持续更新中</p>
        </div>
      </footer>
    </div>
  )
}
