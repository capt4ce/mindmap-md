import { TreeData, FlowNode, FlowEdge } from '@/types'

const NODE_WIDTH = 150
const NODE_HEIGHT = 40
const HORIZONTAL_SPACING = 180
const VERTICAL_SPACING = 60

export function generateFlowElements(tree: TreeData): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []
  const visited = new Set<string>()
  
  // Track y-position for each level
  const levelYPositions: Record<number, number> = {}
  
  function getNextYPosition(level: number): number {
    if (!(level in levelYPositions)) {
      levelYPositions[level] = 0
    }
    const y = levelYPositions[level]
    levelYPositions[level] += VERTICAL_SPACING
    return y
  }
  
  function processNode(nodeId: string): void {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const node = tree.nodes[nodeId]
    if (!node) return
    
    const x = node.level * HORIZONTAL_SPACING
    const y = getNextYPosition(node.level)
    
    nodes.push({
      id: nodeId,
      type: 'mindmap',
      position: { x, y },
      data: {
        label: node.text,
        hasChildren: node.children.length > 0,
        collapsed: node.collapsed,
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
        processNode(childId)
      }
    }
  }
  
  // Process all root nodes
  for (const rootId of tree.rootIds) {
    processNode(rootId)
  }
  
  return { nodes, edges }
}
