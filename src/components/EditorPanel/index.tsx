import { useRef } from 'react'
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
  const editorRef = useRef<Editor | null>(null)
  
  useEditor((root) => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, value)
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          onChange(markdown)
        })
      })
      .config(nord)
      .use(commonmark)
      .use(listener)
    
    editorRef.current = editor
    return editor
  }, [value, onChange])
  
  return <Milkdown />
}

export default function EditorPanel({ value, onChange }: EditorPanelProps) {
  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <span className="toolbar-title">Markdown Editor</span>
      </div>
      <div className="editor-content">
        <MilkdownEditor value={value} onChange={onChange} />
      </div>
    </div>
  )
}
