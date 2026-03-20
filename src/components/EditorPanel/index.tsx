import { useRef, useState, useEffect } from 'react'
import { Milkdown, useEditor } from '@milkdown/react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { nord } from '@milkdown/theme-nord'
import './styles.css'

interface EditorPanelProps {
  value: string
  onChange: (value: string) => void
}

function MilkdownEditor({ value, onChange }: EditorPanelProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEditor((root) => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, value)
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          onChangeRef.current(markdown)
        })
      })
      .config(nord)
      .use(commonmark)
      .use(listener)
    
    return editor
  }, [])
  
  return <Milkdown />
}

export default function EditorPanel({ value, onChange }: EditorPanelProps) {
  // Use a key to force re-render when value changes externally
  // Milkdown's useEditor only uses the initial value and doesn't update on prop changes
  const [editorKey, setEditorKey] = useState(0)
  const lastExternalValueRef = useRef(value)
  
  useEffect(() => {
    // If the value prop changed and is different from what we last saw,
    // it means the value was changed externally (e.g., loading a new document)
    if (value !== lastExternalValueRef.current) {
      lastExternalValueRef.current = value
      setEditorKey(k => k + 1)
    }
  }, [value])

  const handleChange = (newValue: string) => {
    lastExternalValueRef.current = newValue
    onChange(newValue)
  }

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <span className="toolbar-title">Markdown Editor</span>
      </div>
      <div className="editor-content">
        <MilkdownEditor key={editorKey} value={value} onChange={handleChange} />
      </div>
    </div>
  )
}
