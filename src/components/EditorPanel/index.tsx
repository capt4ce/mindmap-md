import { useCallback, useState, useEffect } from 'react'
import './styles.css'

interface EditorPanelProps {
  value: string
  onChange: (value: string) => void
  noteId?: string
}

export default function EditorPanel({ value, onChange, noteId }: EditorPanelProps) {
  const [localValue, setLocalValue] = useState(value)
  
  // Update local value when prop changes (e.g., switching notes)
  useEffect(() => {
    setLocalValue(value)
  }, [value, noteId])
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }, [onChange])
  
  // Handle tab key for indentation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = localValue.substring(0, start) + '  ' + localValue.substring(end)
      setLocalValue(newValue)
      onChange(newValue)
      
      // Restore cursor position
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2
      }, 0)
    }
  }, [localValue, onChange])

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <span className="toolbar-title">Markdown Editor</span>
      </div>
      <div className="editor-content">
        <textarea
          key={noteId || 'default'}
          className="markdown-textarea"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your markdown here...

- Use dashes for bullet points
- Use two spaces for indentation
- Tab key inserts 2 spaces"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
