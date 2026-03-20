import { TreeData, TreeNode } from '@/types'

export function parseMarkdownToTree(markdown: string): TreeData {
  const lines = markdown.split('\n')
  const nodes: Record<string, TreeNode> = {}
  const rootIds: string[] = []
  
  // Stack to track parent nodes at each level
  const parentStack: { id: string; level: number }[] = []
  
  let nodeIdCounter = 0
  
  for (const line of lines) {
    const match = line.match(/^(\s*)-\s+(.*)$/)
    if (!match) continue
    
    const indent = match[1].length
    const text = match[2].trim()
    const level = Math.floor(indent / 2) // 2 spaces = 1 level
    
    const id = `node-${nodeIdCounter++}`
    const node: TreeNode = {
      id,
      text,
      level,
      parentId: null,
      children: [],
      collapsed: false,
    }
    
    // Find parent by popping stack until we find correct level
    while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
      parentStack.pop()
    }
    
    if (parentStack.length > 0) {
      const parent = parentStack[parentStack.length - 1]
      node.parentId = parent.id
      nodes[parent.id].children.push(id)
    } else {
      rootIds.push(id)
    }
    
    nodes[id] = node
    parentStack.push({ id, level })
  }
  
  return { nodes, rootIds }
}
