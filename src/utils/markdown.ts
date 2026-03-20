import { TreeData } from '@/types'

/**
 * Updates a specific node's text in the markdown by its ID
 * The nodeId is in the format "node-{index}" where index corresponds to the line number in the markdown
 */
export function updateNodeInMarkdown(
  markdown: string,
  nodeId: string,
  newText: string,
  treeData: TreeData
): string {
  const node = treeData.nodes[nodeId]
  if (!node) return markdown

  
  // Find which line contains this node by parsing the markdown
  const lines = markdown.split('\n')
  let nodeIndex = 0
  let targetLineIndex = -1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^(\s*)-\s+(.*)$/)
    if (!match) continue
    
    if (`node-${nodeIndex}` === nodeId) {
      targetLineIndex = i
      break
    }
    nodeIndex++
  }
  
  if (targetLineIndex === -1) return markdown
  
  // Replace the text on the target line
  const line = lines[targetLineIndex]
  const match = line.match(/^(\s*-\s+)(.*)$/)
  if (match) {
    lines[targetLineIndex] = match[1] + newText
  }
  
  return lines.join('\n')
}
