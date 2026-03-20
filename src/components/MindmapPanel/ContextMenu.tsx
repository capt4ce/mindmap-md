import { Trash2, Plus, Edit3 } from 'lucide-react'
import './ContextMenu.css'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onAddChild: () => void
  onAddSibling: () => void
  onDelete: () => void
  onEdit: () => void
  canDelete: boolean
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onAddChild,
  onAddSibling,
  onDelete,
  onEdit,
  canDelete,
}: ContextMenuProps) {
  return (
    <>
      <div className="context-menu-overlay" onClick={onClose} />
      <div className="context-menu" style={{ left: x, top: y }}>
        <button className="context-menu-item" onClick={onAddChild}>
          <Plus size={14} />
          <span>Add Child</span>
        </button>
        <button className="context-menu-item" onClick={onAddSibling}>
          <Plus size={14} />
          <span>Add Sibling</span>
        </button>
        <button className="context-menu-item" onClick={onEdit}>
          <Edit3 size={14} />
          <span>Edit Text</span>
        </button>
        {canDelete && (
          <button className="context-menu-item danger" onClick={onDelete}>
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        )}
      </div>
    </>
  )
}
