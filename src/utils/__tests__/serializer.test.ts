import { describe, it, expect } from 'vitest'
import { treeToMarkdown } from '../serializer'
import { TreeData } from '@/types'

describe('treeToMarkdown', () => {
  it('serializes tree without colors', () => {
    const tree: TreeData = {
      rootIds: ['node-0'],
      nodes: {
        'node-0': {
          id: 'node-0',
          text: 'Root',
          level: 0,
          parentId: null,
          children: [],
          collapsed: false,
        },
      },
    }

    expect(treeToMarkdown(tree)).toBe('- Root')
  })

  it('serializes tree with color', () => {
    const tree: TreeData = {
      rootIds: ['node-0'],
      nodes: {
        'node-0': {
          id: 'node-0',
          text: 'Root',
          level: 0,
          parentId: null,
          children: [],
          collapsed: false,
          color: 'red',
        },
      },
    }

    expect(treeToMarkdown(tree)).toBe('- Root {color=red}')
  })

  it('serializes tree with both colors', () => {
    const tree: TreeData = {
      rootIds: ['node-0'],
      nodes: {
        'node-0': {
          id: 'node-0',
          text: 'Root',
          level: 0,
          parentId: null,
          children: [],
          collapsed: false,
          color: '#ff5733',
          outlineColor: '#333',
        },
      },
    }

    expect(treeToMarkdown(tree)).toBe('- Root {color=#ff5733 outline=#333}')
  })

  it('round-trip: parse then serialize preserves colors', async () => {
    const { parseMarkdownToTree } = await import('../parser')
    const markdown = `- Root {color=blue}
  - Child {outline=red}`

    const tree = parseMarkdownToTree(markdown)
    const serialized = treeToMarkdown(tree)

    expect(serialized).toBe(markdown)
  })
})
