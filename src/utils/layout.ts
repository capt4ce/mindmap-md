import { TreeData, FlowNode, FlowEdge, RootConfig } from '@/types'

const DEFAULT_HORIZONTAL_SPACING = 180
const DEFAULT_VERTICAL_SPACING = 60
const ROOT_VERTICAL_SPACING = 150 // Extra spacing between different root nodes

export interface LayoutOptions {
  defaultHorizontalSpacing?: number
  defaultVerticalSpacing?: number
  rootVerticalSpacing?: number
  rootConfigs?: Record<string, RootConfig>
}

export function generateFlowElements(
  tree: TreeData, 
  options: LayoutOptions = {}
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const {
    defaultHorizontalSpacing = DEFAULT_HORIZONTAL_SPACING,
    defaultVerticalSpacing = DEFAULT_VERTICAL_SPACING,
    rootVerticalSpacing = ROOT_VERTICAL_SPACING,
  } = options

  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []
  const visited = new Set<string>()
  
  // Track y-position for each level and each root
  const levelYPositions: Record<string, Record<number, number>> = {}
  
  function getNextYPosition(rootId: string, level: number): number {
    if (!(rootId in levelYPositions)) {
      levelYPositions[rootId] = {}
    }
    if (!(level in levelYPositions[rootId])) {
      levelYPositions[rootId][level] = 0
    }
    const y = levelYPositions[rootId][level]
    const verticalSpacing = level === 0 ? rootVerticalSpacing : defaultVerticalSpacing
    levelYPositions[rootId][level] += verticalSpacing
    return y
  }
  
  // Track the vertical offset for each root (to separate different roots vertically)
  let currentRootYOffset = 0
  const rootYOffsets: Record<string, number> = {}
  
  function processNode(nodeId: string, rootOffsetY: number): void {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const node = tree.nodes[nodeId]
    if (!node) return
    
    // Get spacing for this root (use custom config if available)
    const rootConfig = tree.rootConfigs?.[node.rootId]
    const horizontalSpacing = rootConfig?.horizontalSpacing ?? defaultHorizontalSpacing
    
    const x = node.level * horizontalSpacing
    const y = getNextYPosition(node.rootId, node.level) + rootOffsetY
    
    nodes.push({
      id: nodeId,
      type: 'mindmap',
      position: { x, y },
      data: {
        label: node.text,
        hasChildren: node.children.length > 0,
        collapsed: node.collapsed,
        color: node.color,
        outlineColor: node.outlineColor,
      },
    })
    
    // Process children if not collapsed
    if (!node.collapsed) {
      for (const childId of node.children) {
        edges.push({
          id: `edge-${nodeId}-${childId}`,
          source: nodeId,
          target: childId,
        })
        processNode(childId, rootOffsetY)
      }
    }
  }
  
  // Process all root nodes, with vertical separation between different roots
  for (const rootId of tree.rootIds) {
    rootYOffsets[rootId] = currentRootYOffset
    processNode(rootId, currentRootYOffset)
    
    // Calculate the height of this root's tree and add spacing for the next root
    const maxY = Math.max(...Object.values(levelYPositions[rootId] ?? { 0: 0 }))
    currentRootYOffset += maxY + rootVerticalSpacing
  }
  
  return { nodes, edges }
}
