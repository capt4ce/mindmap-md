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
  const [editorHeight, setEditorHeight] = useState<number>(40)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())
  
  const treeData = useMemo(() => parseMarkdownToTree(markdown), [markdown])
  
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown)
  }, [])

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId)
  }
  
  const handleNodeCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])
  
  const handleResize = useCallback((delta: number) => {
    setEditorHeight(prev => {
      const containerHeight = window.innerHeight - 48
      const pixelHeight = (prev / 100) * containerHeight
      const newPixelHeight = pixelHeight + delta
      const newPercent = (newPixelHeight / containerHeight) * 100
      return Math.max(15, Math.min(70, newPercent))
    })
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mindmap Markdown Editor</h1>
      </header>
      <main className="app-main">
        <div style={{ height: `${100 - editorHeight}%` }}>
          <MindmapPanel 
            treeData={treeData}
            collapsedNodes={collapsedNodes}
            onNodeClick={handleNodeClick}
            onNodeCollapse={handleNodeCollapse}
          />
        </div>
        <ResizableDivider onResize={handleResize} />
        <div style={{ height: `${editorHeight}%` }}>
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
