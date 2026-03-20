import { useCallback, useState, useEffect } from 'react'
import './styles.css'

const INDENT_SIZE = 2

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
  
  // Get the indentation at the current cursor position
  const getLineIndent = (text: string, cursorPos: number): string => {
    // Find the start of the current line
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1
    // Get the current line content
    const currentLine = text.substring(lineStart, cursorPos)
    // Extract leading whitespace
    const match = currentLine.match(/^(\s*)/)
    return match ? match[1] : ''
  }
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    
    // Tab key - insert indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const indent = ' '.repeat(INDENT_SIZE)
      const newValue = localValue.substring(0, start) + indent + localValue.substring(end)
      setLocalValue(newValue)
      onChange(newValue)
      
      // Restore cursor position after the inserted indentation
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + INDENT_SIZE
      }, 0)
      return
    }
    
    // Enter key - copy indentation to new line
    if (e.key === 'Enter') {
      e.preventDefault()
      const indent = getLineIndent(localValue, start)
      const newLine = '\n' + indent
      const newValue = localValue.substring(0, start) + newLine + localValue.substring(end)
      setLocalValue(newValue)
      onChange(newValue)
      
      // Position cursor after the indentation on the new line
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + newLine.length
      }, 0)
      return
    }
    
    // Backspace key - smart unindent
    if (e.key === 'Backspace') {
      // Find the start of the current line
      const lineStart = localValue.lastIndexOf('\n', start - 1) + 1
      const currentLine = localValue.substring(lineStart, start)
      
      // Check if we're at the end of indentation (line starts with spaces and we're at end of spaces)
      const match = currentLine.match(/^(\s+)$/)
      if (match && currentLine.length > 0 && start === lineStart + currentLine.length) {
        e.preventDefault()
        // Calculate how many spaces to remove (up to INDENT_SIZE)
        const spacesToRemove = Math.min(currentLine.length, INDENT_SIZE)
        const newIndentLength = currentLine.length - spacesToRemove
        const newValue = 
          localValue.substring(0, lineStart) + 
          ' '.repeat(newIndentLength) + 
          localValue.substring(start)
        setLocalValue(newValue)
        onChange(newValue)
        
        // Position cursor at end of remaining indentation
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = lineStart + newIndentLength
        }, 0)
      }
      return
    }
    
    // Shift+Tab - remove one level of indentation
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      const lineStart = localValue.lastIndexOf('\n', start - 1) + 1
      const lineEnd = localValue.indexOf('\n', start)
      const actualLineEnd = lineEnd === -1 ? localValue.length : lineEnd
      const currentLine = localValue.substring(lineStart, actualLineEnd)
      
      // Remove up to INDENT_SIZE spaces from the start of the line
      const match = currentLine.match(/^(\s{0,2})/)
      if (match && match[1].length > 0) {
        const newValue = 
          localValue.substring(0, lineStart) + 
          currentLine.substring(match[1].length) + 
          localValue.substring(actualLineEnd)
        setLocalValue(newValue)
        onChange(newValue)
        
        // Adjust cursor position
        setTimeout(() => {
          const newPos = Math.max(start - match[1].length, lineStart)
          target.selectionStart = target.selectionEnd = newPos
        }, 0)
      }
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
- Tab key inserts 2 spaces
- Enter copies indentation from previous line
- Backspace on indent removes 2 spaces"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
