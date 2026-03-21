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

  it('parses nodes without attributes', () => {
    const markdown = '- Node 1';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.rootIds).toHaveLength(1);
    expect(result.nodes[result.rootIds[0]].text).toBe('Node 1');
    expect(result.nodes[result.rootIds[0]].color).toBeUndefined();
    expect(result.nodes[result.rootIds[0]].outlineColor).toBeUndefined();
    expect(result.nodes[result.rootIds[0]].rootId).toBe(result.rootIds[0]);
  });

  it('parses color attribute with = format', () => {
    const markdown = '- Node 1 {color=red}';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].text).toBe('Node 1');
    expect(result.nodes[result.rootIds[0]].color).toBe('red');
  });

  it('parses both color and outline attributes', () => {
    const markdown = '- Node 1 {color=#ff5733 outline=#333333}';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].text).toBe('Node 1');
    expect(result.nodes[result.rootIds[0]].color).toBe('#ff5733');
    expect(result.nodes[result.rootIds[0]].outlineColor).toBe('#333333');
  });

  it('parses CSS variable colors', () => {
    const markdown = '- Node 1 {color=var(--accent)}';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].color).toBe('var(--accent)');
  });

  it('handles text with curly braces in the middle', () => {
    const markdown = '- Node {special} text';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].text).toBe('Node {special} text');
  });

  it('parses nested nodes with attributes', () => {
    const markdown = `- Parent {color=blue}
  - Child {outline=red}`;
    const result = parseMarkdownToTree(markdown);
    
    const parent = result.nodes[result.rootIds[0]];
    expect(parent.color).toBe('blue');
    expect(parent.children).toHaveLength(1);
    
    const child = result.nodes[parent.children[0]];
    expect(child.outlineColor).toBe('red');
    expect(child.text).toBe('Child');
  });
})
