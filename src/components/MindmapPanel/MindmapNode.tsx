import { memo, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import './styles.css'

interface MindmapNodeProps {
  id: string
  data: {
    label: string
    hasChildren: boolean
    collapsed: boolean
    onCollapse?: (id: string) => void
  }
  selected?: boolean
}

const MindmapNode = memo(({ id, data, selected }: MindmapNodeProps) => {
  const { label, hasChildren, collapsed, onCollapse } = data
  
  const handleCollapseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onCollapse?.(id)
  }, [id, onCollapse])
  
  return (
    <div className={`mindmap-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="handle" />
      
      <div className="node-content">
        {hasChildren && (
          <button 
            className="collapse-btn" 
            onClick={handleCollapseClick}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
        <span className="node-label">{label}</span>
      </div>
      
      <Handle type="source" position={Position.Right} className="handle" />
    </div>
  )
})

MindmapNode.displayName = 'MindmapNode'

export default MindmapNode
