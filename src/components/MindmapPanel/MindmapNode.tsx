import { memo, useCallback, useState, useRef, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import './styles.css'

interface MindmapNodeProps {
  id: string
  data: {
    label: string
    hasChildren: boolean
    collapsed: boolean
    color?: string
    outlineColor?: string
    onCollapse?: (id: string) => void
    onEdit?: (id: string, newLabel: string) => void
    onContextMenu?: (id: string, x: number, y: number) => void
  }
  selected?: boolean
}

const MindmapNode = memo(({ id, data, selected }: MindmapNodeProps) => {
  const { label, hasChildren, collapsed, onCollapse, onEdit, onContextMenu } = data
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])
  
  const handleCollapseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onCollapse?.(id)
  }, [id, onCollapse])
  
  const handleDoubleClick = useCallback(() => {
    if (onEdit) {
      setIsEditing(true)
      setEditValue(label)
    }
  }, [label, onEdit])
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }, [])
  
  const handleInputBlur = useCallback(() => {
    if (editValue.trim() !== '' && editValue !== label) {
      onEdit?.(id, editValue.trim())
    }
    setIsEditing(false)
  }, [editValue, label, id, onEdit])
  
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editValue.trim() !== '' && editValue !== label) {
        onEdit?.(id, editValue.trim())
      }
      setIsEditing(false)
    } else if (e.key === 'Escape') {
      setEditValue(label)
      setIsEditing(false)
    }
  }, [editValue, label, id, onEdit])
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu?.(id, e.clientX, e.clientY)
  }, [id, onContextMenu])
  
  return (
    <div 
      className={`mindmap-node ${selected ? 'selected' : ''}`} 
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      style={{
        ...(data.color && { backgroundColor: data.color }),
        ...(data.outlineColor && { borderColor: data.outlineColor }),
      }}
    >
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
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="node-edit-input"
          />
        ) : (
          <span className="node-label" title="Double-click to edit">{label}</span>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="handle" />
    </div>
  )
})

MindmapNode.displayName = 'MindmapNode'

export default MindmapNode
