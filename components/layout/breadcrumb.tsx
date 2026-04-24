"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-6 flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href="/"
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-3.5 w-3.5" />
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                "hover:text-foreground",
                index === items.length - 1 && "font-medium text-foreground"
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                index === items.length - 1 && "font-medium text-foreground"
              )}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
