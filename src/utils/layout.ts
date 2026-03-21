import { TreeData, FlowNode, FlowEdge, RootConfig } from '@/types'

const DEFAULT_HORIZONTAL_SPACING = 220
const DEFAULT_VERTICAL_SPACING = 70
const ROOT_VERTICAL_SPACING = 100 // Extra spacing between different root nodes

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
  
  // Track the next available Y position for leaf nodes
  let nextLeafY = 0
  
  // Store node Y positions for calculating parent positions
  const nodeYPositions: Record<string, number> = {}
  
  // Calculate the vertical span of a subtree (returns [minY, maxY])
  function calculateSubtreeSpan(nodeId: string): [number, number] {
    const node = tree.nodes[nodeId]
    if (!node) return [0, 0]
    
    if (node.collapsed || node.children.length === 0) {
      // Leaf node (or collapsed) - takes one slot
      const y = nextLeafY
      nextLeafY += defaultVerticalSpacing
      nodeYPositions[nodeId] = y
      return [y, y]
    }
    
    // Process all children first
    let minY = Infinity
    let maxY = -Infinity
    
    for (const childId of node.children) {
      const [childMin, childMax] = calculateSubtreeSpan(childId)
      minY = Math.min(minY, childMin)
      maxY = Math.max(maxY, childMax)
      
      // Add edge
      edges.push({
        id: `edge-${nodeId}-${childId}`,
        source: nodeId,
        target: childId,
      })
    }
    
    // Parent is centered between first and last child
    const y = (minY + maxY) / 2
    nodeYPositions[nodeId] = y
    return [minY, maxY]
  }
  
  // Second pass: create nodes with calculated positions
  function createNode(nodeId: string, rootOffsetY: number): void {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const node = tree.nodes[nodeId]
    if (!node) return
    
    const rootConfig = tree.rootConfigs?.[node.rootId]
    const horizontalSpacing = rootConfig?.horizontalSpacing ?? defaultHorizontalSpacing
    
    const x = node.level * horizontalSpacing
    const y = nodeYPositions[nodeId] + rootOffsetY
    
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
        createNode(childId, rootOffsetY)
      }
    }
  }
  
  // Process all root nodes
  for (const rootId of tree.rootIds) {
    // First pass: calculate Y positions for this tree
    calculateSubtreeSpan(rootId)
    
    // Second pass: create nodes
    createNode(rootId, 0)
    
    // Add spacing for next root
    nextLeafY += rootVerticalSpacing
  }
  
  return { nodes, edges }
}
