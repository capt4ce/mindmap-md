import { describe, it, expect } from 'vitest'
import { generateFlowElements } from '../layout'
import { TreeData } from '@/types'

describe('generateFlowElements', () => {
  it('should generate nodes and edges from tree', () => {
    const tree: TreeData = {
      nodes: {
        'node-0': { id: 'node-0', text: 'Root', level: 0, parentId: null, rootId: 'node-0', children: ['node-1'], collapsed: false },
        'node-1': { id: 'node-1', text: 'Child', level: 1, parentId: 'node-0', rootId: 'node-0', children: [], collapsed: false },
      },
      rootIds: ['node-0'],
    }
    
    const { nodes, edges } = generateFlowElements(tree)
    
    expect(nodes).toHaveLength(2)
    expect(edges).toHaveLength(1)
    expect(nodes[0].data.label).toBe('Root')
    expect(edges[0].source).toBe('node-0')
    expect(edges[0].target).toBe('node-1')
  })

  it('should position nodes in horizontal tree layout', () => {
    const tree: TreeData = {
      nodes: {
        'node-0': { id: 'node-0', text: 'Root', level: 0, parentId: null, rootId: 'node-0', children: [], collapsed: false },
      },
      rootIds: ['node-0'],
    }
    
    const { nodes } = generateFlowElements(tree)
    
    expect(nodes[0].position.x).toBe(0)
    expect(nodes[0].position.y).toBe(0)
  })

  it('should position child nodes to the right of parent', () => {
    const tree: TreeData = {
      nodes: {
        'node-0': { id: 'node-0', text: 'Root', level: 0, parentId: null, rootId: 'node-0', children: ['node-1'], collapsed: false },
        'node-1': { id: 'node-1', text: 'Child', level: 1, parentId: 'node-0', rootId: 'node-0', children: [], collapsed: false },
      },
      rootIds: ['node-0'],
    }
    
    const { nodes } = generateFlowElements(tree)
    const parent = nodes.find(n => n.id === 'node-0')
    const child = nodes.find(n => n.id === 'node-1')
    
    expect(child!.position.x).toBeGreaterThan(parent!.position.x)
  })

  it('should not generate edges or children for collapsed nodes', () => {
    const tree: TreeData = {
      nodes: {
        'node-0': { id: 'node-0', text: 'Root', level: 0, parentId: null, rootId: 'node-0', children: ['node-1'], collapsed: true },
        'node-1': { id: 'node-1', text: 'Child', level: 1, parentId: 'node-0', rootId: 'node-0', children: [], collapsed: false },
      },
      rootIds: ['node-0'],
    }
    
    const { nodes, edges } = generateFlowElements(tree)
    
    // Only root node should be generated
    expect(nodes).toHaveLength(1)
    expect(edges).toHaveLength(0)
  })

  it('should handle multiple root nodes', () => {
    const tree: TreeData = {
      nodes: {
        'node-0': { id: 'node-0', text: 'Root 1', level: 0, parentId: null, rootId: 'node-0', children: [], collapsed: false },
        'node-1': { id: 'node-1', text: 'Root 2', level: 0, parentId: null, rootId: 'node-1', children: [], collapsed: false },
      },
      rootIds: ['node-0', 'node-1'],
    }
    
    const { nodes, edges } = generateFlowElements(tree)
    
    expect(nodes).toHaveLength(2)
    expect(edges).toHaveLength(0)
    expect(nodes[0].position.y).not.toBe(nodes[1].position.y)
  })

  it('should apply custom horizontal spacing per root', () => {
    const tree: TreeData = {
      nodes: {
        'node-0': { id: 'node-0', text: 'Root 1', level: 0, parentId: null, rootId: 'node-0', children: ['node-1'], collapsed: false },
        'node-1': { id: 'node-1', text: 'Child 1', level: 1, parentId: 'node-0', rootId: 'node-0', children: [], collapsed: false },
        'node-2': { id: 'node-2', text: 'Root 2', level: 0, parentId: null, rootId: 'node-2', children: ['node-3'], collapsed: false },
        'node-3': { id: 'node-3', text: 'Child 2', level: 1, parentId: 'node-2', rootId: 'node-2', children: [], collapsed: false },
      },
      rootIds: ['node-0', 'node-2'],
      rootConfigs: {
        'node-2': { id: 'node-2', horizontalSpacing: 300 },
      },
    }
    
    const { nodes } = generateFlowElements(tree)
    
    const child1 = nodes.find(n => n.id === 'node-1')
    const child2 = nodes.find(n => n.id === 'node-3')
    
    // Child of root with custom spacing (300) should be further right than child with default spacing (180)
    expect(child2!.position.x).toBe(300)
    expect(child1!.position.x).toBe(180)
  })
})
