import React from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { getNavigationTree } from "@/lib/navigation"

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const navigation = getNavigationTree()

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar navigation={navigation} />
        <main className="flex-1 lg:ml-72">
          <div className="container max-w-5xl py-8 px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
