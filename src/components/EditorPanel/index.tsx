import { useCallback, useState, useEffect, useRef } from 'react'
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
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
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
  
  const detectFormatsAtCursor = useCallback((text: string, cursorPos: number) => {
    // Get current line
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1
    const lineEnd = text.indexOf('\n', cursorPos)
    const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd)
    
    // Get text before and after cursor within the line
    const beforeCursor = line.substring(0, cursorPos - lineStart)
    const afterCursor = line.substring(cursorPos - lineStart)
    
    // Check for bold: **text** or __text__
    // Look for opening marker before cursor and closing marker after cursor
    const boldOpenBefore = beforeCursor.match(/\*\*[^*]*$/) || beforeCursor.match(/__[^_]*$/)
    const boldCloseAfter = afterCursor.match(/^[^*]*\*\*/) || afterCursor.match(/^[^_]*__/)
    const isBold = !!(boldOpenBefore && boldCloseAfter)
    
    // Check for italic: *text* or _text_ (but not ** which is bold)
    // Look for single asterisk/underscore pairs (Safari-compatible patterns)
    const italicOpenBefore = beforeCursor.match(/(?:^|[^*])\*[^*]*$/) || beforeCursor.match(/(?:^|[^_])_[^_]*$/)
    const italicCloseAfter = afterCursor.match(/^[^*]*\*($|[^*])/) || afterCursor.match(/^[^_]*_($|[^_])/)
    const isItalic = !!(italicOpenBefore && italicCloseAfter)
    
    // Check for underline: <u>text</u>
    const underlineOpenBefore = beforeCursor.match(/<u>[^<]*$/)
    const underlineCloseAfter = afterCursor.match(/^[^<]*<\/u>/)
    const isUnderline = !!(underlineOpenBefore && underlineCloseAfter)
    
    return { bold: isBold, italic: isItalic, underline: isUnderline }
  }, [])

  const handleSelect = useCallback(() => {
    if (!textareaRef.current) return
    const pos = textareaRef.current.selectionStart
    setActiveFormats(detectFormatsAtCursor(localValue, pos))
  }, [localValue, detectFormatsAtCursor])

  const handleFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
    if (!textareaRef.current) return
    
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const selectedText = localValue.substring(start, end)
    
    const formatMarkers: Record<string, { open: string; close: string }> = {
      bold: { open: '**', close: '**' },
      italic: { open: '*', close: '*' },
      underline: { open: '<u>', close: '</u>' },
    }
    
    const marker = formatMarkers[format]
    const isFormatted = activeFormats[format]
    
    let newText: string
    let newCursorStart: number
    let newCursorEnd: number
    
    if (isFormatted && selectedText) {
      // Remove formatting from selection by stripping markers around it
      const beforeSelection = localValue.substring(0, start)
      const afterSelection = localValue.substring(end)
      // Check if markers exist right before/after selection and remove them
      const hasOpenMarker = beforeSelection.endsWith(marker.open)
      const hasCloseMarker = afterSelection.startsWith(marker.close)
      if (hasOpenMarker && hasCloseMarker) {
        newText = beforeSelection.slice(0, -marker.open.length) + selectedText + afterSelection.slice(marker.close.length)
        newCursorStart = start - marker.open.length
        newCursorEnd = end - marker.open.length
      } else {
        // Fallback: just keep text as-is
        newText = localValue
        newCursorStart = start
        newCursorEnd = end
      }
    } else if (isFormatted) {
      // Remove formatting around cursor - find and remove nearest markers
      const beforeText = localValue.substring(0, start)
      const afterText = localValue.substring(end)
      const openIndex = beforeText.lastIndexOf(marker.open)
      const closeIndex = afterText.indexOf(marker.close)
      if (openIndex !== -1 && closeIndex !== -1) {
        newText = beforeText.substring(0, openIndex) + beforeText.substring(openIndex + marker.open.length) +
                  afterText.substring(0, closeIndex) + afterText.substring(closeIndex + marker.close.length)
        newCursorStart = openIndex
        newCursorEnd = openIndex + (start - openIndex - marker.open.length)
      } else {
        newText = localValue
        newCursorStart = start
        newCursorEnd = end
      }
    } else if (selectedText) {
      // Wrap selection with format
      newText = localValue.substring(0, start) + marker.open + selectedText + marker.close + localValue.substring(end)
      newCursorStart = start
      newCursorEnd = end + marker.open.length + marker.close.length
    } else {
      // Insert empty format markers and place cursor inside
      const emptyFormat = marker.open + marker.close
      newText = localValue.substring(0, start) + emptyFormat + localValue.substring(end)
      newCursorStart = start + marker.open.length
      newCursorEnd = start + marker.open.length
    }
    
    setLocalValue(newText)
    onChange(newText)
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1)
    if (newHistory.length >= 50) newHistory.shift()
    newHistory.push(newText)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    // Restore selection and update formats after render
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorStart
        textareaRef.current.selectionEnd = newCursorEnd
        textareaRef.current.focus()
        setActiveFormats(detectFormatsAtCursor(newText, newCursorStart))
      }
    }, 0)
  }, [localValue, history, historyIndex, onChange, activeFormats, detectFormatsAtCursor])
  
  const getLineIndent = (text: string, cursorPos: number): string => {
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1
    const currentLine = text.substring(lineStart, cursorPos)
    const match = currentLine.match(/^(\s*)/)
    return match ? match[1] : ''
  }
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return
      }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        handleRedo()
        return
      }
      if (e.key === 'b') {
        e.preventDefault()
        handleFormat('bold')
        return
      }
      if (e.key === 'i') {
        e.preventDefault()
        handleFormat('italic')
        return
      }
      if (e.key === 'u') {
        e.preventDefault()
        handleFormat('underline')
        return
      }
    }

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
          onApplyColor={() => {}}
        />
      </div>
      <div className="editor-content">
        <textarea
          ref={textareaRef}
          className="markdown-textarea"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
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
