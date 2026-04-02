import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import './styles.css'

interface EdgeGroupNodeProps {
  id: string
  data: {
    label: string
    sourceId: string
    targetIds: string[]
  }
  selected?: boolean
}

const EdgeGroupNode = memo(({ data, selected }: EdgeGroupNodeProps) => {
  const { label, targetIds } = data

  return (
    <div className={`edge-group-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="handle" />
      
      <div className="edge-group-content">
        <span className="edge-group-label">{label}</span>
        {targetIds.length > 1 && (
          <span className="edge-group-count">({targetIds.length})</span>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="handle" />
    </div>
  )
})

EdgeGroupNode.displayName = 'EdgeGroupNode'

export default EdgeGroupNode
