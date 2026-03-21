# Editor Toolbar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a toolbar to the EditorPanel with undo/redo, text formatting (bold/italic/underline), and node color controls.

**Architecture:** Create a new `EditorToolbar` component that manages toolbar UI and delegates actions to `EditorPanel` via callbacks. EditorPanel maintains history state and handles text transformations. Use Lucide icons for toolbar buttons.

**Tech Stack:** React, TypeScript, Lucide React icons

---

### Task 1: Create EditorToolbar Component Structure

**Files:**
- Create: `src/components/EditorToolbar/index.tsx`
- Create: `src/components/EditorToolbar/styles.css`

**Step 1: Create directory and component file**

```bash
mkdir -p src/components/EditorToolbar
```

**Step 2: Write EditorToolbar component**

`src/components/EditorToolbar/index.tsx`:

```typescript
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
```

**Step 3: Write CSS styles**

`src/components/EditorToolbar/styles.css`:

```css
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background-color: var(--border-color);
  margin: 0 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.toolbar-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}
```

**Step 4: Verify component compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add src/components/EditorToolbar/
git commit -m "feat: create EditorToolbar component with undo/redo and format buttons"
```

---

### Task 2: Integrate Toolbar into EditorPanel (Basic)

**Files:**
- Modify: `src/components/EditorPanel/index.tsx:1-150`

**Step 1: Import EditorToolbar**

Add import at top:
```typescript
import EditorToolbar from '../EditorToolbar'
```

**Step 2: Add history state management**

Add state hooks after existing state:
```typescript
const [history, setHistory] = useState<string[]>([value])
const [historyIndex, setHistoryIndex] = useState(0)
```

**Step 3: Add active formats state**

```typescript
const [activeFormats, setActiveFormats] = useState({
  bold: false,
  italic: false,
  underline: false,
})
```

**Step 4: Add undo/redo handlers**

```typescript
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
```

**Step 5: Add format handler (placeholder)**

```typescript
const handleFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
  // Placeholder - will implement in Task 3
  console.log('Format:', format)
}, [])
```

**Step 6: Add history update on text change**

Modify `handleChange` to push to history:
```typescript
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
```

**Step 7: Insert toolbar in JSX**

Replace the existing toolbar div with:
```tsx
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
```

**Step 8: Update CSS class reference**

Remove or rename the old toolbar-title div - we no longer need it.

**Step 9: Run build and test**

Run: `npm run build`
Expected: No errors

**Step 10: Commit**

```bash
git add src/components/EditorPanel/
git commit -m "feat: integrate EditorToolbar with undo/redo functionality"
```

---

### Task 3: Implement Text Formatting

**Files:**
- Modify: `src/components/EditorPanel/index.tsx`

**Step 1: Implement format detection function**

Add helper to detect formats at cursor position:
```typescript
const detectFormatsAtCursor = useCallback((text: string, cursorPos: number) => {
  // Get current line
  const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1
  const lineEnd = text.indexOf('\n', cursorPos)
  const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd)
  
  // Check for bold: **text** or __text__
  const beforeCursor = line.substring(0, cursorPos - lineStart)
  const afterCursor = line.substring(cursorPos - lineStart)
  
  const hasBoldBefore = /\*\*[^*]*$/.test(beforeCursor) || /__[^_]*$/.test(beforeCursor)
  const hasBoldAfter = /^[^*]*\*\*/.test(afterCursor) || /^[^_]*__/.test(afterCursor)
  const isBold = hasBoldBefore && hasBoldAfter
  
  // Check for italic: *text* or _text_ (but not **)
  const hasItalicBefore = /(?<!\*)\*[^*]*$/.test(beforeCursor) || /(?<!_)_[^_]*$/.test(beforeCursor)
  const hasItalicAfter = /^[^*]*\*(?!\*)/.test(afterCursor) || /^[^_]*_(?!_)/.test(afterCursor)
  const isItalic = hasItalicBefore && hasItalicAfter
  
  // Check for underline: <u>text</u>
  const hasUnderlineBefore = /<u>[^<]*$/.test(beforeCursor)
  const hasUnderlineAfter = /^[^<]*<\/u>/.test(afterCursor)
  const isUnderline = hasUnderlineBefore && hasUnderlineAfter
  
  return { bold: isBold, italic: isItalic, underline: isUnderline }
}, [])
```

**Step 2: Update cursor position tracking**

Add state for cursor position:
```typescript
const [cursorPosition, setCursorPosition] = useState(0)
```

Add onSelect handler:
```typescript
const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
  const target = e.target as HTMLTextAreaElement
  const pos = target.selectionStart
  setCursorPosition(pos)
  setActiveFormats(detectFormatsAtCursor(localValue, pos))
}, [localValue, detectFormatsAtCursor])
```

**Step 3: Implement format toggle function**

Replace placeholder `handleFormat`:
```typescript
const handleFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
  const textarea = document.querySelector('.markdown-textarea') as HTMLTextAreaElement
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = localValue.substring(start, end)
  
  let newText: string
  let newCursorStart: number
  let newCursorEnd: number
  
  const formatMarkers: Record<string, { open: string; close: string }> = {
    bold: { open: '**', close: '**' },
    italic: { open: '*', close: '*' },
    underline: { open: '<u>', close: '</u>' },
  }
  
  const marker = formatMarkers[format]
  const isFormatted = activeFormats[format]
  
  if (isFormatted) {
    // Remove formatting
    // Find and remove markers around cursor/selection
    const beforeText = localValue.substring(0, start)
    const afterText = localValue.substring(end)
    
    // Simple approach: remove markers if they exist at boundaries
    const escapedOpen = marker.open.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const escapedClose = marker.close.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    const openRegex = new RegExp(escapedOpen + '$')
    const closeRegex = new RegExp('^' + escapedClose)
    
    if (openRegex.test(beforeText) && closeRegex.test(afterText)) {
      newText = beforeText.replace(openRegex, '') + selectedText + afterText.replace(closeRegex, '')
      newCursorStart = start - marker.open.length
      newCursorEnd = end - marker.open.length
    } else {
      // Fallback: wrap with opposite
      newText = localValue.substring(0, start) + marker.open + selectedText + marker.close + localValue.substring(end)
      newCursorStart = start + marker.open.length
      newCursorEnd = end + marker.open.length
    }
  } else {
    // Add formatting
    newText = localValue.substring(0, start) + marker.open + selectedText + marker.close + localValue.substring(end)
    newCursorStart = start + marker.open.length
    newCursorEnd = end + marker.open.length
  }
  
  setLocalValue(newText)
  onChange(newText)
  
  // Update history
  const newHistory = history.slice(0, historyIndex + 1)
  if (newHistory.length >= 50) newHistory.shift()
  newHistory.push(newText)
  setHistory(newHistory)
  setHistoryIndex(newHistory.length - 1)
  
  // Restore selection after render
  setTimeout(() => {
    textarea.selectionStart = newCursorStart
    textarea.selectionEnd = newCursorEnd
    textarea.focus()
    setActiveFormats(detectFormatsAtCursor(newText, newCursorStart))
  }, 0)
}, [localValue, history, historyIndex, onChange, activeFormats, detectFormatsAtCursor])
```

**Step 4: Add keyboard shortcuts**

Add to handleKeyDown:
```typescript
// Add at start of handleKeyDown, before other checks
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
```

**Step 5: Add onSelect to textarea**

```tsx
<textarea
  className="markdown-textarea"
  value={localValue}
  onChange={handleChange}
  onKeyDown={handleKeyDown}
  onSelect={handleSelect}
  // ... rest
/>
```

**Step 6: Run tests**

Run: `npm test`
Expected: All tests pass

**Step 7: Commit**

```bash
git add src/components/EditorPanel/
git commit -m "feat: implement text formatting with WYSIWYG active states"
```

---

### Task 4: Add Color Controls to Toolbar

**Files:**
- Modify: `src/components/EditorToolbar/index.tsx`
- Modify: `src/components/EditorToolbar/styles.css`

**Step 1: Add color props and UI to EditorToolbar**

Add to interface:
```typescript
interface EditorToolbarProps {
  // ... existing props
  currentColor?: string
  currentOutlineColor?: string
  onApplyColor: (type: 'color' | 'outlineColor', value: string) => void
}
```

Add preset colors constant (already in file, keep it).

Add color section to component:
```tsx
// Add before closing </div>:
<div className="toolbar-divider" />

<div className="toolbar-group color-group">
  <span className="toolbar-label">Fill:</span>
  <div className="color-swatches">
    {PRESET_COLORS.map((color) => (
      <button
        key={color}
        className={`color-swatch ${currentColor === color ? 'active' : ''}`}
        style={{ backgroundColor: color }}
        onClick={() => onApplyColor('color', color)}
        title={`Fill color ${color}`}
      />
    ))}
    <input
      type="color"
      className="color-picker"
      value={currentColor || '#000000'}
      onChange={(e) => onApplyColor('color', e.target.value)}
      title="Custom fill color"
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
        className={`color-swatch ${currentOutlineColor === color ? 'active' : ''}`}
        style={{ backgroundColor: color }}
        onClick={() => onApplyColor('outlineColor', color)}
        title={`Outline color ${color}`}
      />
    ))}
    <input
      type="color"
      className="color-picker"
      value={currentOutlineColor || '#000000'}
      onChange={(e) => onApplyColor('outlineColor', e.target.value)}
      title="Custom outline color"
    />
  </div>
</div>
```

**Step 2: Add CSS for color controls**

Add to styles.css:
```css
.color-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.color-swatches {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s, border-color 0.15s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 1px var(--bg-primary), 0 0 0 2px var(--accent-color);
}

.color-picker {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: 2px solid var(--border-color);
  border-radius: 50%;
}
```

**Step 3: Run build**

Run: `npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/EditorToolbar/
git commit -m "feat: add color swatches and picker to toolbar"
```

---

### Task 5: Implement Color Application in EditorPanel

**Files:**
- Modify: `src/components/EditorPanel/index.tsx`

**Step 1: Add color detection function**

```typescript
const detectColorsAtLine = useCallback((text: string, cursorPos: number) => {
  const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1
  const lineEnd = text.indexOf('\n', cursorPos)
  const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd)
  
  // Check for {color=...} or {color:...}
  const colorMatch = line.match(/\{[^}]*\bcolor[=:]([^}\s]+)/)
  const outlineMatch = line.match(/\{[^}]*\boutline[=:]([^}\s]+)/)
  
  return {
    color: colorMatch ? colorMatch[1] : undefined,
    outlineColor: outlineMatch ? outlineMatch[1] : undefined,
  }
}, [])
```

**Step 2: Add current color state**

```typescript
const [currentColors, setCurrentColors] = useState<{ color?: string; outlineColor?: string }>({})
```

**Step 3: Update handleSelect to track colors**

```typescript
const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
  const target = e.target as HTMLTextAreaElement
  const pos = target.selectionStart
  setCursorPosition(pos)
  setActiveFormats(detectFormatsAtCursor(localValue, pos))
  setCurrentColors(detectColorsAtLine(localValue, pos))
}, [localValue, detectFormatsAtCursor, detectColorsAtLine])
```

**Step 4: Implement handleApplyColor**

```typescript
const handleApplyColor = useCallback((type: 'color' | 'outlineColor', value: string) => {
  const textarea = document.querySelector('.markdown-textarea') as HTMLTextAreaElement
  if (!textarea) return
  
  const cursorPos = textarea.selectionStart
  const lineStart = localValue.lastIndexOf('\n', cursorPos - 1) + 1
  const lineEnd = localValue.indexOf('\n', cursorPos)
  const actualLineEnd = lineEnd === -1 ? localValue.length : lineEnd
  
  const beforeLine = localValue.substring(0, lineStart)
  const line = localValue.substring(lineStart, actualLineEnd)
  const afterLine = localValue.substring(actualLineEnd)
  
  // Parse existing attributes
  const attrMatch = line.match(/^(.*?)\s*(\{[^}]*\})?\s*$/)
  if (!attrMatch) return
  
  const nodeText = attrMatch[1]
  const existingAttrs = attrMatch[2] || ''
  
  // Parse existing attributes into a map
  const attrMap: Record<string, string> = {}
  if (existingAttrs) {
    const attrContent = existingAttrs.slice(1, -1) // Remove { and }
    const pairs = attrContent.split(/[;\s]+/).filter(Boolean)
    for (const pair of pairs) {
      const match = pair.match(/^(\w+)[=:](.+)$/)
      if (match) {
        attrMap[match[1]] = match[2]
      }
    }
  }
  
  // Update the specific attribute
  const attrName = type === 'color' ? 'color' : 'outline'
  attrMap[attrName] = value
  
  // Build new attribute string
  const attrEntries = Object.entries(attrMap)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')
  const newAttrs = attrEntries ? ` {${attrEntries}}` : ''
  
  const newLine = nodeText + newAttrs
  const newText = beforeLine + newLine + afterLine
  
  setLocalValue(newText)
  onChange(newText)
  setCurrentColors(detectColorsAtLine(newText, cursorPos))
  
  // Update history
  const newHistory = history.slice(0, historyIndex + 1)
  if (newHistory.length >= 50) newHistory.shift()
  newHistory.push(newText)
  setHistory(newHistory)
  setHistoryIndex(newHistory.length - 1)
}, [localValue, history, historyIndex, onChange, detectColorsAtLine])
```

**Step 5: Pass color props to EditorToolbar**

```tsx
<EditorToolbar
  canUndo={historyIndex > 0}
  canRedo={historyIndex < history.length - 1}
  activeFormats={activeFormats}
  currentColor={currentColors.color}
  currentOutlineColor={currentColors.outlineColor}
  onUndo={handleUndo}
  onRedo={handleRedo}
  onFormat={handleFormat}
  onApplyColor={handleApplyColor}
/>
```

**Step 6: Run tests and build**

Run: `npm test && npm run build`
Expected: All tests pass, build clean

**Step 7: Commit**

```bash
git add src/components/EditorPanel/
git commit -m "feat: implement color application to current line"
```

---

### Task 6: Final Verification and Polish

**Files:**
- All modified files

**Step 1: Run all tests**

Run: `npm test`
Expected: 20 tests pass

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build

**Step 3: Start dev server and manually test**

Run: `npm run dev`

Test scenarios:
- Type text, use undo/redo
- Select text, apply bold/italic/underline
- Check active state feedback
- Click on colored node, verify swatches show active state
- Apply colors via presets and custom picker
- Verify mindmap updates with colors

**Step 4: Final commit if any fixes needed**

```bash
git status
# If any changes:
git add -A
git commit -m "fix: toolbar polish and edge cases"
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/EditorToolbar/index.tsx` | New - Toolbar component with undo/redo, format buttons, color swatches |
| `src/components/EditorToolbar/styles.css` | New - Toolbar styling |
| `src/components/EditorPanel/index.tsx` | Modified - History management, format detection, color application |
| `src/components/EditorPanel/styles.css` | Modified - Adjust layout for new toolbar |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+U | Underline |
