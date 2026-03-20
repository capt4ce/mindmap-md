import { TreeData } from '@/types'

export function treeToMarkdown(tree: TreeData): string {
  const lines: string[] = []
  
  function processNode(nodeId: string, indent: number) {
    const node = tree.nodes[nodeId]
    if (!node) return
    
    const spaces = '  '.repeat(indent)
    lines.push(`${spaces}- ${node.text}`)
    
    for (const childId of node.children) {
      processNode(childId, indent + 1)
    }
  }
  
  for (const rootId of tree.rootIds) {
    processNode(rootId, 0)
  }
  
  return lines.join('\n')
}
