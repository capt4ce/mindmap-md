import { TreeData, FlowNode, FlowEdge, RootConfig, EdgeGroupNode } from '@/types'

const DEFAULT_HORIZONTAL_SPACING = 220
const DEFAULT_VERTICAL_SPACING = 70
const ROOT_VERTICAL_SPACING = 100 // Extra spacing between different root nodes
const EDGE_GROUP_SPACING = 100 // Horizontal space for edge group node

export interface LayoutOptions {
  defaultHorizontalSpacing?: number
  defaultVerticalSpacing?: number
  rootVerticalSpacing?: number
  rootConfigs?: Record<string, RootConfig>
}

// Group children by edge name
function groupChildrenByEdgeName(nodeId: string, tree: TreeData): Map<string | undefined, string[]> {
  const node = tree.nodes[nodeId]
  if (!node) return new Map()

  const groups = new Map<string | undefined, string[]>()
  
  for (const childId of node.children) {
    const child = tree.nodes[childId]
    if (!child) continue
    
    const edgeName = child.edgeName
    if (!groups.has(edgeName)) {
      groups.set(edgeName, [])
    }
    groups.get(edgeName)!.push(childId)
  }
  
  return groups
}

export function generateFlowElements(
  tree: TreeData, 
  options: LayoutOptions = {}
): { nodes: (FlowNode | EdgeGroupNode)[]; edges: FlowEdge[] } {
  const {
    defaultHorizontalSpacing = DEFAULT_HORIZONTAL_SPACING,
    defaultVerticalSpacing = DEFAULT_VERTICAL_SPACING,
    rootVerticalSpacing = ROOT_VERTICAL_SPACING,
  } = options

  const nodes: (FlowNode | EdgeGroupNode)[] = []
  const edges: FlowEdge[] = []
  const visited = new Set<string>()
  const edgeGroupNodes = new Map<string, EdgeGroupNode>() // key: "parentId:edgeName"
  
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
    
    // Group children by edge name
    const childGroups = groupChildrenByEdgeName(nodeId, tree)
    
    // Process all children first
    let minY = Infinity
    let maxY = -Infinity
    
    for (const [, childIds] of childGroups) {
      for (const childId of childIds) {
        const [childMin, childMax] = calculateSubtreeSpan(childId)
        minY = Math.min(minY, childMin)
        maxY = Math.max(maxY, childMax)
      }
    }
    
    // Parent is centered between first and last child
    const y = (minY + maxY) / 2
    nodeYPositions[nodeId] = y
    return [minY, maxY]
  }
  
  // Second pass: create nodes and edges with calculated positions
  function createNode(nodeId: string, rootOffsetY: number): void {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const node = tree.nodes[nodeId]
    if (!node) return
    
    const rootConfig = tree.rootConfigs?.[node.rootId]
    const horizontalSpacing = rootConfig?.horizontalSpacing ?? defaultHorizontalSpacing
    
    const x = node.level * (horizontalSpacing + EDGE_GROUP_SPACING)
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
        tags: node.tags,
      },
    })
    
    // Process children if not collapsed
    if (!node.collapsed) {
      // Group children by edge name
      const childGroups = groupChildrenByEdgeName(nodeId, tree)
      
      for (const [edgeName, childIds] of childGroups) {
        if (edgeName && childIds.length > 0) {
          // Create edge group node
          const groupId = `edge-group-${nodeId}-${edgeName}`
          const groupKey = `${nodeId}:${edgeName}`
          
          // Calculate Y position for edge group (center of all its children)
          let groupMinY = Infinity
          let groupMaxY = -Infinity
          for (const childId of childIds) {
            const childY = nodeYPositions[childId]
            groupMinY = Math.min(groupMinY, childY)
            groupMaxY = Math.max(groupMaxY, childY)
          }
          const groupY = (groupMinY + groupMaxY) / 2 + rootOffsetY
          const groupX = x + horizontalSpacing
          
          const edgeGroupNode: EdgeGroupNode = {
            id: groupId,
            type: 'edgeGroup',
            position: { x: groupX, y: groupY },
            data: {
              label: edgeName,
              sourceId: nodeId,
              targetIds: childIds,
            },
          }
          
          if (!edgeGroupNodes.has(groupKey)) {
            edgeGroupNodes.set(groupKey, edgeGroupNode)
            nodes.push(edgeGroupNode)
          }
          
          // Connect parent to edge group
          edges.push({
            id: `edge-${nodeId}-${groupId}`,
            source: nodeId,
            target: groupId,
            label: edgeName,
          })
          
          // Connect edge group to children
          for (const childId of childIds) {
            edges.push({
              id: `edge-${groupId}-${childId}`,
              source: groupId,
              target: childId,
            })
            createNode(childId, rootOffsetY)
          }
        } else {
          // No edge name or single child - connect directly
          for (const childId of childIds) {
            edges.push({
              id: `edge-${nodeId}-${childId}`,
              source: nodeId,
              target: childId,
            })
            createNode(childId, rootOffsetY)
          }
        }
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
