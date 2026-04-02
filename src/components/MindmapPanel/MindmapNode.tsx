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
    tags: string[]
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
  
  // Generate a consistent color for a tag based on its name
  const getTagColor = (tag: string): string => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
    ]
    let hash = 0
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

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
      
      <div className="node-content-wrapper">
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
        {data.tags && data.tags.length > 0 && (
          <div className="node-tags">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="node-tag"
                style={{ backgroundColor: getTagColor(tag) }}
                title={`Tag: ${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="handle" />
    </div>
  )
})

MindmapNode.displayName = 'MindmapNode'

export default MindmapNode
