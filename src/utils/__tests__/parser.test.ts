import { describe, it, expect } from 'vitest'
import { parseMarkdownToTree } from '../parser'

describe('parseMarkdownToTree', () => {
  it('should parse flat bullet list', () => {
    const markdown = `- Item 1
- Item 2
- Item 3`
    
    const result = parseMarkdownToTree(markdown)
    
    expect(Object.keys(result.nodes)).toHaveLength(3)
    expect(result.rootIds).toHaveLength(3)
    expect(result.nodes[result.rootIds[0]].text).toBe('Item 1')
  })

  it('should parse nested bullet list', () => {
    const markdown = `- Parent
  - Child 1
  - Child 2`
    
    const result = parseMarkdownToTree(markdown)
    
    expect(Object.keys(result.nodes)).toHaveLength(3)
    expect(result.rootIds).toHaveLength(1)
    const parent = result.nodes[result.rootIds[0]]
    expect(parent.children).toHaveLength(2)
  })

  it('should handle deeply nested lists', () => {
    const markdown = `- Level 0
  - Level 1
    - Level 2
      - Level 3`
    
    const result = parseMarkdownToTree(markdown)
    
    expect(Object.keys(result.nodes)).toHaveLength(4)
    
    const level0 = result.nodes[result.rootIds[0]]
    expect(level0.level).toBe(0)
    
    const level1 = result.nodes[level0.children[0]]
    expect(level1.level).toBe(1)
    
    const level2 = result.nodes[level1.children[0]]
    expect(level2.level).toBe(2)
  })

  it('should ignore non-bullet lines', () => {
    const markdown = `Some text
- Item 1
More text
  - Item 1.1
# Heading`
    
    const result = parseMarkdownToTree(markdown)
    
    expect(Object.keys(result.nodes)).toHaveLength(2)
  })

  it('should handle empty markdown', () => {
    const result = parseMarkdownToTree('')
    
    expect(Object.keys(result.nodes)).toHaveLength(0)
    expect(result.rootIds).toHaveLength(0)
  })
})
