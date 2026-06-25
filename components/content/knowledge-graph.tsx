"use client"

/**
 * 文件功能说明：
 * 渲染文章详情页的关联章节知识图谱，展示当前章节、相关章节和交叉引用之间的关系。
 */

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { type GraphNode, type GraphLink } from "@/types"

interface KnowledgeGraphProps {
  nodes: GraphNode[]
  links: GraphLink[]
}

/**
 * 对图谱节点按 id 去重，保留第一次出现的节点。
 * @param nodes 原始图谱节点列表。
 * @returns 去重后的节点列表。
 */
function dedupeGraphNodes(nodes: GraphNode[]) {
  const nodeMap = new Map<string, GraphNode>()

  nodes.forEach((node) => {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node)
    }
  })

  return Array.from(nodeMap.values())
}

/**
 * 对图谱边按 source、target、type 去重，并过滤缺失端点的边。
 * @param links 原始图谱边列表。
 * @param nodeIds 当前可渲染节点 id 集合。
 * @returns 去重后的图谱边列表。
 */
function dedupeGraphLinks(links: GraphLink[], nodeIds: Set<string>) {
  const linkSet = new Set<string>()
  const dedupedLinks: GraphLink[] = []

  links.forEach((link) => {
    if (!nodeIds.has(link.source) || !nodeIds.has(link.target)) {
      return
    }

    const linkKey = `${link.source}->${link.target}:${link.type}`
    if (linkSet.has(linkKey)) {
      return
    }

    linkSet.add(linkKey)
    dedupedLinks.push(link)
  })

  return dedupedLinks
}

/**
 * 渲染知识图谱并计算节点在 SVG 画布中的稳定位置。
 * @param nodes 图谱节点列表。
 * @param links 图谱边列表。
 * @returns React 知识图谱组件。
 */
export function KnowledgeGraph({ nodes, links }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const graphNodes = React.useMemo(() => dedupeGraphNodes(nodes), [nodes])
  const graphNodeIds = React.useMemo(() => new Set(graphNodes.map((node) => node.id)), [graphNodes])
  const graphLinks = React.useMemo(() => dedupeGraphLinks(links, graphNodeIds), [links, graphNodeIds])

  useEffect(() => {
    if (graphNodes.length === 0) return

    // 中文注释：使用轻量力导向布局，避免为小型章节关系图引入额外运行时依赖。
    const width = 600
    const height = 300
    const nodeRadius = 30
    const centerX = width / 2
    const centerY = height / 2

    const pos = new Map<string, { x: number; y: number; vx: number; vy: number }>()

    // 中文注释：先按圆形分布初始化节点，当前章节固定在中心附近。
    graphNodes.forEach((node, i) => {
      const angle = (i / graphNodes.length) * 2 * Math.PI - Math.PI / 2
      const radius = node.group === "current" ? 0 : 120
      pos.set(node.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      })
    })

    // 中文注释：执行固定步数模拟，保证每次渲染位置稳定且不会持续占用主线程。
    for (let step = 0; step < 100; step++) {
      // 中文注释：节点之间互相排斥，减少文字和圆点重叠。
      for (let i = 0; i < graphNodes.length; i++) {
        for (let j = i + 1; j < graphNodes.length; j++) {
          const a = pos.get(graphNodes[i].id)!
          const b = pos.get(graphNodes[j].id)!
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 2000 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          a.vx -= fx
          a.vy -= fy
          b.vx += fx
          b.vy += fy
        }
      }

      // 中文注释：有关联的节点通过弹簧力拉近，体现章节关系。
      graphLinks.forEach((link) => {
        const a = pos.get(link.source)
        const b = pos.get(link.target)
        if (!a || !b) return
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const targetDist = 100
        const force = (dist - targetDist) * 0.01
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy
      })

      // 中文注释：中心引力和阻尼让图谱保持在画布范围内。
      graphNodes.forEach((node) => {
        const p = pos.get(node.id)!
        const dx = centerX - p.x
        const dy = centerY - p.y
        p.vx += dx * 0.001
        p.vy += dy * 0.001

        // Damping and update
        p.vx *= 0.9
        p.vy *= 0.9
        p.x += p.vx
        p.y += p.vy

        // Keep in bounds
        p.x = Math.max(nodeRadius, Math.min(width - nodeRadius, p.x))
        p.y = Math.max(nodeRadius, Math.min(height - nodeRadius, p.y))
      })
    }

    const finalPos = new Map<string, { x: number; y: number }>()
    graphNodes.forEach((node) => {
      const p = pos.get(node.id)!
      finalPos.set(node.id, { x: p.x, y: p.y })
    })
    setPositions(finalPos)
  }, [graphNodes, graphLinks])

  const getNodeColor = (group: GraphNode["group"]) => {
    switch (group) {
      case "current":
        return "#2563eb"
      case "related":
        return "#059669"
      case "cross":
        return "#d97706"
      case "chapter":
        return "#6b7280"
    }
  }

  const getLinkStyle = (type: GraphLink["type"]) => {
    switch (type) {
      case "related":
        return { stroke: "#059669", strokeWidth: 1.5, strokeDasharray: "none" }
      case "cross":
        return { stroke: "#d97706", strokeWidth: 1, strokeDasharray: "5,5" }
      case "chapter":
        return { stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "2,4" }
    }
  }

  if (graphNodes.length === 0) return null

  return (
    <div className="my-8 rounded-lg border bg-card p-4">
      <h4 className="mb-4 text-sm font-semibold">关联章节网络</h4>
      <div className="relative overflow-hidden rounded-md">
        <svg ref={svgRef} viewBox="0 0 600 300" className="w-full">
          {/* Links */}
          {graphLinks.map((link) => {
            const a = positions.get(link.source)
            const b = positions.get(link.target)
            if (!a || !b) return null
            const style = getLinkStyle(link.type)
            return (
              <line
                key={`${link.source}->${link.target}:${link.type}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                {...style}
              />
            )
          })}
          {/* Nodes */}
          {graphNodes.map((node) => {
            const pos = positions.get(node.id)
            if (!pos) return null
            const isHovered = hoveredNode?.id === node.id
            return (
              <g key={node.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={node.group === "current" ? 12 : 8}
                  fill={getNodeColor(node.group)}
                  opacity={isHovered ? 1 : 0.9}
                  stroke={isHovered ? "#000" : "none"}
                  strokeWidth={isHovered ? 2 : 0}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
                <text
                  x={pos.x}
                  y={pos.y + (node.group === "current" ? 20 : 16)}
                  textAnchor="middle"
                  className="fill-foreground text-[10px]"
                >
                  {node.title.length > 8 ? node.title.slice(0, 8) + "..." : node.title}
                </text>
              </g>
            )
          })}
        </svg>
        {hoveredNode && (
          <div className="absolute bottom-2 left-2 rounded bg-background/90 px-3 py-2 text-xs shadow border">
            <p className="font-medium">{hoveredNode.title}</p>
            {hoveredNode.group !== "current" && hoveredNode.slug && (
              <Link href={`/${hoveredNode.slug}`} className="text-primary hover:underline">
                点击跳转 →
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span> 当前章节
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span> 关联章节
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-600"></span> 交叉引用
        </div>
      </div>
    </div>
  )
}
