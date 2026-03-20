import { useCallback, useEffect } from 'react'
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
import type { TreeData } from '@/types'
import { generateFlowElements } from '@/utils/layout'

const nodeTypes = {
  mindmap: MindmapNode,
}

interface MindmapPanelProps {
  treeData: TreeData
  onNodeClick?: (nodeId: string) => void
  onNodeCollapse?: (nodeId: string) => void
}

function MindmapPanelInner({ treeData, onNodeClick, onNodeCollapse }: MindmapPanelProps) {
  const { nodes: initialNodes, edges: initialEdges } = generateFlowElements(treeData)
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // Update when treeData changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateFlowElements(treeData)
    // Inject onCollapse handler into node data
    const nodesWithHandler = newNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onCollapse: onNodeCollapse,
      },
    }))
    setNodes(nodesWithHandler)
    setEdges(newEdges)
  }, [treeData, setNodes, setEdges, onNodeCollapse])
  
  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    onNodeClick?.(node.id)
  }, [onNodeClick])
  
  return (
    <div className="mindmap-panel">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="var(--border-color)" gap={20} size={1} />
        <Controls />
      </ReactFlow>
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
