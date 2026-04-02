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

  it('parses edge name with > syntax', () => {
    const markdown = '- Parent\n  - Child > related-to';
    const result = parseMarkdownToTree(markdown);
    
    const parent = result.nodes[result.rootIds[0]];
    const child = result.nodes[parent.children[0]];
    expect(child.text).toBe('Child');
    expect(child.edgeName).toBe('related-to');
  });

  it('parses edge name with spaces around >', () => {
    const markdown = '- Parent\n  - Child  >  my-edge-name';
    const result = parseMarkdownToTree(markdown);
    
    const parent = result.nodes[result.rootIds[0]];
    const child = result.nodes[parent.children[0]];
    expect(child.text).toBe('Child');
    expect(child.edgeName).toBe('my-edge-name');
  });

  it('parses edge name and color attributes together', () => {
    const markdown = '- Parent\n  - Child > edge-name {color=red}';
    const result = parseMarkdownToTree(markdown);
    
    const parent = result.nodes[result.rootIds[0]];
    const child = result.nodes[parent.children[0]];
    expect(child.text).toBe('Child');
    expect(child.edgeName).toBe('edge-name');
    expect(child.color).toBe('red');
  });

  it('handles node without edge name', () => {
    const markdown = '- Node 1';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].text).toBe('Node 1');
    expect(result.nodes[result.rootIds[0]].edgeName).toBeUndefined();
  });

  it('parses multiple children with same edge name', () => {
    const markdown = `- Parent
  - Child 1 > has-type
  - Child 2 > has-type
  - Child 3 > has-type`;
    const result = parseMarkdownToTree(markdown);
    
    const parent = result.nodes[result.rootIds[0]];
    expect(parent.children).toHaveLength(3);
    
    for (const childId of parent.children) {
      expect(result.nodes[childId].edgeName).toBe('has-type');
    }
  });

  it('parses single tag from node text', () => {
    const markdown = '- Task #work';
    const result = parseMarkdownToTree(markdown);
    
    const node = result.nodes[result.rootIds[0]];
    expect(node.text).toBe('Task');
    expect(node.tags).toEqual(['work']);
  });

  it('parses multiple tags from node text', () => {
    const markdown = '- Task #work #urgent';
    const result = parseMarkdownToTree(markdown);
    
    const node = result.nodes[result.rootIds[0]];
    expect(node.text).toBe('Task');
    expect(node.tags).toEqual(['work', 'urgent']);
  });

  it('handles node without tags', () => {
    const markdown = '- Task without tags';
    const result = parseMarkdownToTree(markdown);
    
    const node = result.nodes[result.rootIds[0]];
    expect(node.text).toBe('Task without tags');
    expect(node.tags).toEqual([]);
  });

  it('parses tags with numbers and underscores', () => {
    const markdown = '- Task #work_2024 #item_1';
    const result = parseMarkdownToTree(markdown);
    
    const node = result.nodes[result.rootIds[0]];
    expect(node.text).toBe('Task');
    expect(node.tags).toEqual(['work_2024', 'item_1']);
  });

  it('parses tags combined with other attributes', () => {
    const markdown = '- Task #work {color=red}';
    const result = parseMarkdownToTree(markdown);
    
    const node = result.nodes[result.rootIds[0]];
    expect(node.text).toBe('Task');
    expect(node.tags).toEqual(['work']);
    expect(node.color).toBe('red');
  });

  it('parses tags with edge name', () => {
    const markdown = `- Parent
  - Child #work > related-to`;
    const result = parseMarkdownToTree(markdown);
    
    const parent = result.nodes[result.rootIds[0]];
    const child = result.nodes[parent.children[0]];
    expect(child.text).toBe('Child');
    expect(child.tags).toEqual(['work']);
    expect(child.edgeName).toBe('related-to');
  });

  it('round-trip: parse then serialize preserves tags', async () => {
    const { treeToMarkdown } = await import('../serializer')
    const markdown = `- Task #work #urgent`;

    const tree = parseMarkdownToTree(markdown)
    const serialized = treeToMarkdown(tree)

    expect(serialized).toBe(markdown)
  });
})
