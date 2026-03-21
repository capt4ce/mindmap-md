import { TreeData, TreeNode } from '@/types'

/**
 * Parse color attributes from text like "Node name {color=red outline=#333}"
 * Returns the clean text and extracted attributes
 */
function parseNodeAttributes(text: string): {
  cleanText: string;
  color?: string;
  outlineColor?: string;
} {
  const attrMatch = text.match(/\{([^}]*)\}$/);
  if (!attrMatch) {
    return { cleanText: text };
  }

  const attrString = attrMatch[1];
  const cleanText = text.slice(0, -attrMatch[0].length).trim();

  const attrs: { color?: string; outlineColor?: string } = {};

  // Support both "color=red outline=blue" and "color: red; outline: blue;" formats
  const pairs = attrString.split(/[;\s]+/).filter(Boolean);

  for (const pair of pairs) {
    const match = pair.match(/^(color|outline):?=?(.+)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key === 'color') {
        attrs.color = value;
      } else if (key === 'outline') {
        attrs.outlineColor = value;
      }
    }
  }

  return { cleanText, ...attrs };
}

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
    const rawText = match[2].trim();
    const { cleanText: text, color, outlineColor } = parseNodeAttributes(rawText);
    const level = Math.floor(indent / 2) // 2 spaces = 1 level
    
    const id = `node-${nodeIdCounter++}`
    
    // Find parent by popping stack until we find correct level
    while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
      parentStack.pop()
    }
    
    // Determine rootId: if no parent, this is a new root
    let rootId: string
    if (parentStack.length > 0) {
      const parent = parentStack[parentStack.length - 1]
      rootId = nodes[parent.id].rootId
    } else {
      rootId = id
      rootIds.push(id)
    }
    
    const node: TreeNode = {
      id,
      text,
      level,
      parentId: parentStack.length > 0 ? parentStack[parentStack.length - 1].id : null,
      rootId,
      children: [],
      collapsed: false,
      color,
      outlineColor,
    }
    
    if (parentStack.length > 0) {
      const parent = parentStack[parentStack.length - 1]
      nodes[parent.id].children.push(id)
    }
    
    nodes[id] = node
    parentStack.push({ id, level })
  }
  
  return { nodes, rootIds }
}
