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
          rootId: 'node-0',
          children: [],
          collapsed: false,
          tags: [],
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
          rootId: 'node-0',
          children: [],
          collapsed: false,
          color: 'red',
          tags: [],
        }
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
          rootId: 'node-0',
          children: [],
          collapsed: false,
          color: '#ff5733',
          outlineColor: '#333',
          tags: [],
        }
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

  it('serializes tree with edge name', () => {
    const tree: TreeData = {
      rootIds: ['node-0'],
      nodes: {
        'node-0': {
          id: 'node-0',
          text: 'Parent',
          level: 0,
          parentId: null,
          rootId: 'node-0',
          children: ['node-1'],
          collapsed: false,
          tags: [],
        },
        'node-1': {
          id: 'node-1',
          text: 'Child',
          level: 1,
          parentId: 'node-0',
          rootId: 'node-0',
          children: [],
          collapsed: false,
          edgeName: 'related-to',
          tags: [],
        }
      },
    }

    expect(treeToMarkdown(tree)).toBe(`- Parent
  - Child > related-to`)
  })

  it('serializes tree with edge name and color', () => {
    const tree: TreeData = {
      rootIds: ['node-0'],
      nodes: {
        'node-0': {
          id: 'node-0',
          text: 'Parent',
          level: 0,
          parentId: null,
          rootId: 'node-0',
          children: ['node-1'],
          collapsed: false,
          tags: [],
        },
        'node-1': {
          id: 'node-1',
          text: 'Child',
          level: 1,
          parentId: 'node-0',
          rootId: 'node-0',
          children: [],
          collapsed: false,
          edgeName: 'has-type',
          color: 'red',
          tags: [],
        }
      },
    }

    expect(treeToMarkdown(tree)).toBe(`- Parent
  - Child > has-type {color=red}`)
  })

  it('round-trip: parse then serialize preserves edge names', async () => {
    const { parseMarkdownToTree } = await import('../parser')
    const markdown = `- Parent
  - Child > related-to`

    const tree = parseMarkdownToTree(markdown)
    const serialized = treeToMarkdown(tree)

    expect(serialized).toBe(markdown)
  })
})
