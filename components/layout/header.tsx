"use client"

/**
 * 文件功能说明：
 * 渲染文档页顶部导航栏，包含站点入口、全站搜索和明暗主题切换。
 */

import React from "react"
import Link from "next/link"
import { BookOpen, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { SearchDialog } from "./search-dialog"

/**
 * 渲染全站顶部导航。
 * @returns React 顶部导航组件。
 */
export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="hidden font-bold sm:inline-block">前端百科全书</span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          <SearchDialog />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">切换主题</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
