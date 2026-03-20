import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import MindmapNode from './MindmapNode'
import ContextMenu from './ContextMenu'
import { TreeData } from '@/types'
import { generateFlowElements } from '@/utils/layout'

const nodeTypes = {
  mindmap: MindmapNode,
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
  
  // Apply collapsed state to treeData before generating flow
  const effectiveTreeData = useMemo(() => {
    const modifiedNodes = { ...treeData.nodes }
    for (const nodeId of collapsedNodes) {
      if (modifiedNodes[nodeId]) {
        modifiedNodes[nodeId] = { ...modifiedNodes[nodeId], collapsed: true }
      }
    }
    return { ...treeData, nodes: modifiedNodes }
  }, [treeData, collapsedNodes])
  
  const { nodes: initialNodes, edges: initialEdges } = generateFlowElements(effectiveTreeData)
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateFlowElements(effectiveTreeData)
    // Inject onCollapse, onEdit, and onContextMenu handlers into node data
    const nodesWithHandler = newNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onCollapse: onNodeCollapse,
        onEdit: onNodeEdit,
        onContextMenu: (id: string, x: number, y: number) => {
          setContextMenu({ x, y, nodeId: id })
        },
      },
    }))
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
        fitView
        attributionPosition="bottom-right"
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
