import { useState, useMemo, useCallback } from 'react'
import MindmapPanel from './components/MindmapPanel'
import EditorPanel from './components/EditorPanel'
import ResizableDivider from './components/ResizableDivider'
import { parseMarkdownToTree } from './utils/parser'
import './styles/App.css'

const DEFAULT_MARKDOWN = `- Project Ideas
  - Mobile App
    - Fitness Tracker
    - Recipe Manager
  - Web Tool
    - Markdown Editor
    - API Dashboard
- Resources
  - Design Inspiration
  - Code Snippets`

function App() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN)
  const [editorHeight, setEditorHeight] = useState<number>(40) // percentage
  
  const treeData = useMemo(() => parseMarkdownToTree(markdown), [markdown])
  
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown)
  }, [])

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId)
  }
  
  const handleResize = useCallback((delta: number) => {
    setEditorHeight(prev => {
      const containerHeight = window.innerHeight - 48 // subtract header
      const pixelHeight = (prev / 100) * containerHeight
      const newPixelHeight = pixelHeight + delta
      const newPercent = (newPixelHeight / containerHeight) * 100
      return Math.max(15, Math.min(70, newPercent)) // clamp between 15% and 70%
    })
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mindmap Markdown Editor</h1>
      </header>
      <main className="app-main">
        <div 
          className="mindmap-container"
          style={{ height: `${100 - editorHeight}%` }}
        >
          <MindmapPanel 
            treeData={treeData} 
            onNodeClick={handleNodeClick}
          />
        </div>
        <ResizableDivider onResize={handleResize} />
        <div 
          className="editor-container"
          style={{ height: `${editorHeight}%` }}
        >
          <EditorPanel 
            value={markdown}
            onChange={handleMarkdownChange}
          />
        </div>
      </main>
    </div>
  )
}

export default App
