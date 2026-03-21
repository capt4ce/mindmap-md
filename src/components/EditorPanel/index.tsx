import { useCallback, useState, useEffect } from 'react'
import './styles.css'
import EditorToolbar from '../EditorToolbar'

const INDENT_SIZE = 2

interface EditorPanelProps {
  value: string
  onChange: (value: string) => void
  noteId?: string
}

export default function EditorPanel({ value, onChange, noteId }: EditorPanelProps) {
  const [localValue, setLocalValue] = useState(value)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [activeFormats, _setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  })
  
  useEffect(() => {
    setLocalValue(value)
  }, [value, noteId])
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    
    // Push to history (remove future states if we're not at end)
    const newHistory = history.slice(0, historyIndex + 1)
    if (newHistory.length >= 50) {
      newHistory.shift() // Remove oldest
    }
    newHistory.push(newValue)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    onChange(newValue)
  }, [history, historyIndex, onChange])
  
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setLocalValue(history[newIndex])
      onChange(history[newIndex])
    }
  }, [history, historyIndex, onChange])
  
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setLocalValue(history[newIndex])
      onChange(history[newIndex])
    }
  }, [history, historyIndex, onChange])
  
  const handleFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
    // Placeholder - will implement in Task 3
    console.log('Format:', format)
  }, [])
  
  const getLineIndent = (text: string, cursorPos: number): string => {
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1
    const currentLine = text.substring(lineStart, cursorPos)
    const match = currentLine.match(/^(\s*)/)
    return match ? match[1] : ''
  }
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const indent = ' '.repeat(INDENT_SIZE)
      const newValue = localValue.substring(0, start) + indent + localValue.substring(end)
      setLocalValue(newValue)
      onChange(newValue)
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + INDENT_SIZE
      }, 0)
      return
    }
    
    if (e.key === 'Enter') {
      e.preventDefault()
      
      // Find the current line
      const lineStart = localValue.lastIndexOf('\n', start - 1) + 1
      const currentLine = localValue.substring(lineStart, start)
      
      // Check if current line is a list item (starts with optional spaces, then '- ')
      const listMatch = currentLine.match(/^(\s*)- \s*/)
      
      let newLine: string
      if (listMatch) {
        // Current line is a list item, copy indent and add '- '
        const indent = listMatch[1]
        newLine = '\n' + indent + '- '
      } else {
        // Not a list item, just copy indentation
        const indent = getLineIndent(localValue, start)
        newLine = '\n' + indent
      }
      
      const newValue = localValue.substring(0, start) + newLine + localValue.substring(end)
      setLocalValue(newValue)
      onChange(newValue)
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + newLine.length
      }, 0)
      return
    }
    
    if (e.key === 'Backspace') {
      const lineStart = localValue.lastIndexOf('\n', start - 1) + 1
      const currentLine = localValue.substring(lineStart, start)
      
      const match = currentLine.match(/^(\s+)$/)
      if (match && currentLine.length > 0 && start === lineStart + currentLine.length) {
        e.preventDefault()
        const spacesToRemove = Math.min(currentLine.length, INDENT_SIZE)
        const newIndentLength = currentLine.length - spacesToRemove
        const newValue = 
          localValue.substring(0, lineStart) + 
          ' '.repeat(newIndentLength) + 
          localValue.substring(start)
        setLocalValue(newValue)
        onChange(newValue)
        
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = lineStart + newIndentLength
        }, 0)
      }
      return
    }
    
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      const lineStart = localValue.lastIndexOf('\n', start - 1) + 1
      const lineEnd = localValue.indexOf('\n', start)
      const actualLineEnd = lineEnd === -1 ? localValue.length : lineEnd
      const currentLine = localValue.substring(lineStart, actualLineEnd)
      
      const match = currentLine.match(/^(\s{0,2})/)
      if (match && match[1].length > 0) {
        const newValue = 
          localValue.substring(0, lineStart) + 
          currentLine.substring(match[1].length) + 
          localValue.substring(actualLineEnd)
        setLocalValue(newValue)
        onChange(newValue)
        
        setTimeout(() => {
          const newPos = Math.max(start - match[1].length, lineStart)
          target.selectionStart = target.selectionEnd = newPos
        }, 0)
      }
    }
  }, [localValue, onChange])

  return (
    <div className="editor-panel">
      <div className="editor-toolbar-container">
        <EditorToolbar
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          activeFormats={activeFormats}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onFormat={handleFormat}
        />
      </div>
      <div className="editor-content">
        <textarea
          className="markdown-textarea"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your markdown here...

- Use dashes for bullet points
- Press Enter on a list item to create a new list item
- Tab key inserts 2 spaces
- Backspace on indent removes 2 spaces"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
