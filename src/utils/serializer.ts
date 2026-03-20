import { TreeData } from '@/types'

export function treeToMarkdown(tree: TreeData): string {
  const lines: string[] = []
  
  function processNode(nodeId: string, indent: number) {
    const node = tree.nodes[nodeId]
    if (!node) return
    
    const spaces = '  '.repeat(indent)
    let line = `${spaces}- ${node.text}`

    // Append color attributes if present
    if (node.color || node.outlineColor) {
      const attrs: string[] = []
      if (node.color) attrs.push(`color=${node.color}`)
      if (node.outlineColor) attrs.push(`outline=${node.outlineColor}`)
      line += ` {${attrs.join(' ')}}`
    }

    lines.push(line)
    
    for (const childId of node.children) {
      processNode(childId, indent + 1)
    }
  }
  
  for (const rootId of tree.rootIds) {
    processNode(rootId, 0)
  }
  
  return lines.join('\n')
}
