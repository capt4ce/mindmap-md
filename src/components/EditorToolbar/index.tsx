import { Undo, Redo, Bold, Italic, Underline } from 'lucide-react'
import './styles.css'

interface EditorToolbarProps {
  canUndo: boolean
  canRedo: boolean
  activeFormats: { bold: boolean; italic: boolean; underline: boolean }
  currentColor?: string
  currentOutlineColor?: string
  onUndo: () => void
  onRedo: () => void
  onFormat: (format: 'bold' | 'italic' | 'underline') => void
  onApplyColor: (type: 'color' | 'outlineColor', value: string) => void
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#f97316', // orange
  '#6b7280', // gray
  '#000000', // black
]

export default function EditorToolbar({
  canUndo,
  canRedo,
  activeFormats,
  currentColor,
  currentOutlineColor,
  onUndo,
  onRedo,
  onFormat,
  onApplyColor,
}: EditorToolbarProps) {
  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
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
          aria-label="Bold"
          aria-pressed={activeFormats.bold}
        >
          <Bold size={16} />
        </button>
        <button
          className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
          onClick={() => onFormat('italic')}
          title="Italic (Ctrl+I)"
          aria-label="Italic"
          aria-pressed={activeFormats.italic}
        >
          <Italic size={16} />
        </button>
        <button
          className={`toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
          onClick={() => onFormat('underline')}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
          aria-pressed={activeFormats.underline}
        >
          <Underline size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group color-group">
        <span className="toolbar-label">Fill:</span>
        <div className="color-swatches">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-swatch ${currentColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onApplyColor('color', color)}
              title={`Fill color ${color}`}
              aria-label={`Select fill color ${color}`}
            />
          ))}
          <input
            type="color"
            className="color-picker"
            value={currentColor || '#000000'}
            onChange={(e) => onApplyColor('color', e.target.value)}
            title="Custom fill color"
            aria-label="Custom fill color picker"
          />
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group color-group">
        <span className="toolbar-label">Outline:</span>
        <div className="color-swatches">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-swatch ${currentOutlineColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onApplyColor('outlineColor', color)}
              title={`Outline color ${color}`}
              aria-label={`Select outline color ${color}`}
            />
          ))}
          <input
            type="color"
            className="color-picker"
            value={currentOutlineColor || '#000000'}
            onChange={(e) => onApplyColor('outlineColor', e.target.value)}
            title="Custom outline color"
            aria-label="Custom outline color picker"
          />
        </div>
      </div>
    </div>
  )
}
