import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  NodeMouseHandler,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import MindmapNode from './MindmapNode'
import EdgeGroupNode from './EdgeGroupNode'
import ContextMenu from './ContextMenu'
import { TagFilter } from './TagFilter'
import { TreeData, TreeNode } from '@/types'
import { generateFlowElements } from '@/utils/layout'

const nodeTypes = {
  mindmap: MindmapNode,
  edgeGroup: EdgeGroupNode,
}

interface MindmapPanelProps {
  treeData: TreeData
  collapsedNodes: Set<string>
  onNodeClick?: (nodeId: string) => void
  onNodeCollapse?: (nodeId: string) => void
  onNodeEdit?: (nodeId: string, newLabel: string) => void
  onNodeAction?: (action: 'addChild' | 'addSibling' | 'delete' | 'edit', nodeId: string) => void
}

function MindmapPanelInner({ 
  treeData, 
  collapsedNodes, 
  onNodeClick, 
  onNodeCollapse,
  onNodeEdit,
  onNodeAction,
}: MindmapPanelProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Toggle a tag in the filter
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      }
      return [...prev, tag]
    })
  }, [])

  // Clear all tag filters
  const handleClearFilters = useCallback(() => {
    setSelectedTags([])
  }, [])

  // Compute visible nodes based on selected tags
  // When tags are selected, show nodes that match ALL tags AND their paths to root
  const filteredTreeData = useMemo((): TreeData => {
    if (selectedTags.length === 0) {
      return treeData
    }

    // Find all nodes that contain ALL selected tags (AND operator)
    const matchingNodeIds = new Set<string>()
    for (const [nodeId, node] of Object.entries(treeData.nodes)) {
      const hasAllTags = selectedTags.every(tag => node.tags.includes(tag))
      if (hasAllTags) {
        matchingNodeIds.add(nodeId)
      }
    }

    // If no nodes match, return empty tree
    if (matchingNodeIds.size === 0) {
      return { ...treeData, nodes: {}, rootIds: [] }
    }

    // Collect all node IDs that should be visible (matching nodes + their paths to root)
    const visibleNodeIds = new Set<string>()
    
    for (const matchingId of matchingNodeIds) {
      // Add the matching node
      visibleNodeIds.add(matchingId)
      
      // Add all ancestors up to root
      let currentId: string | null = matchingId
      while (currentId !== null) {
        const currentNode: TreeNode | undefined = treeData.nodes[currentId]
        if (!currentNode) break
        visibleNodeIds.add(currentId)
        currentId = currentNode.parentId
      }
    }

    // Build filtered nodes, keeping only visible ones
    const filteredNodes: Record<string, TreeNode> = {}
    for (const nodeId of visibleNodeIds) {
      const node = treeData.nodes[nodeId]
      if (node) {
        // Filter children to only include visible ones
        filteredNodes[nodeId] = {
          ...node,
          children: node.children.filter(childId => visibleNodeIds.has(childId)),
        }
      }
    }

    // Filter root IDs to only include visible ones
    const filteredRootIds = treeData.rootIds.filter(rootId => visibleNodeIds.has(rootId))

    return {
      ...treeData,
      nodes: filteredNodes,
      rootIds: filteredRootIds,
    }
  }, [treeData, selectedTags])
  
  // Apply collapsed state to filtered treeData before generating flow
  const effectiveTreeData = useMemo(() => {
    const modifiedNodes = { ...filteredTreeData.nodes }
    for (const nodeId of collapsedNodes) {
      if (modifiedNodes[nodeId]) {
        modifiedNodes[nodeId] = { ...modifiedNodes[nodeId], collapsed: true }
      }
    }
    return { ...filteredTreeData, nodes: modifiedNodes }
  }, [filteredTreeData, collapsedNodes])
  
  const { nodes: initialNodes, edges: initialEdges } = generateFlowElements(effectiveTreeData)
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateFlowElements(effectiveTreeData)
    // Inject onCollapse, onEdit, and onContextMenu handlers into mindmap node data only
    const nodesWithHandler = newNodes.map(node => {
      if (node.type === 'mindmap') {
        return {
          ...node,
          data: {
            ...node.data,
            onCollapse: onNodeCollapse,
            onEdit: onNodeEdit,
            onContextMenu: (id: string, x: number, y: number) => {
              setContextMenu({ x, y, nodeId: id })
            },
          },
        }
      }
      return node
    })
    setNodes(nodesWithHandler)
    setEdges(newEdges)
  }, [effectiveTreeData, setNodes, setEdges, onNodeCollapse, onNodeEdit])
  
  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    onNodeClick?.(node.id)
  }, [onNodeClick])
  
  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null)
  }, [])
  
  const canDelete = contextMenu ? treeData.rootIds.length > 1 || treeData.nodes[contextMenu.nodeId]?.parentId !== null : false
  
  return (
    <div className="mindmap-panel">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handleContextMenuClose}
        nodeTypes={nodeTypes}
        attributionPosition="bottom-right"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="var(--border-color)" gap={20} size={1} />
        <Controls />
      </ReactFlow>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleContextMenuClose}
          onAddChild={() => {
            onNodeAction?.('addChild', contextMenu.nodeId)
            handleContextMenuClose()
          }}
          onAddSibling={() => {
            onNodeAction?.('addSibling', contextMenu.nodeId)
            handleContextMenuClose()
          }}
          onDelete={() => {
            onNodeAction?.('delete', contextMenu.nodeId)
            handleContextMenuClose()
          }}
          onEdit={() => {
            onNodeAction?.('edit', contextMenu.nodeId)
            handleContextMenuClose()
          }}
          canDelete={canDelete}
        />
      )}
      
      <Panel position="top-left">
        <TagFilter
          treeData={treeData}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          onClearFilters={handleClearFilters}
        />
      </Panel>
    </div>
  )
}

export default function MindmapPanel(props: MindmapPanelProps) {
  return (
    <ReactFlowProvider>
      <MindmapPanelInner {...props} />
    </ReactFlowProvider>
  )
}
