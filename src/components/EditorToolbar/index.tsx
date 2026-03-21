import { Undo, Redo, Bold, Italic, Underline } from 'lucide-react'
import './styles.css'

interface EditorToolbarProps {
  canUndo: boolean
  canRedo: boolean
  activeFormats: { bold: boolean; italic: boolean; underline: boolean }
  onUndo: () => void
  onRedo: () => void
  onFormat: (format: 'bold' | 'italic' | 'underline') => void
}

export default function EditorToolbar({
  canUndo,
  canRedo,
  activeFormats,
  onUndo,
  onRedo,
  onFormat,
}: EditorToolbarProps) {
  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
          onClick={() => onFormat('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
          onClick={() => onFormat('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          className={`toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
          onClick={() => onFormat('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
      </div>
    </div>
  )
}
