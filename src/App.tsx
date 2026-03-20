import { useState, useMemo, useCallback } from 'react'
import MindmapPanel from './components/MindmapPanel'
import EditorPanel from './components/EditorPanel'
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
  
  const treeData = useMemo(() => parseMarkdownToTree(markdown), [markdown])
  
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown)
  }, [])

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mindmap Markdown Editor</h1>
      </header>
      <main className="app-main">
        <MindmapPanel 
          treeData={treeData} 
          onNodeClick={handleNodeClick}
        />
        <div className="divider" />
        <EditorPanel 
          value={markdown}
          onChange={handleMarkdownChange}
        />
      </main>
    </div>
  )
}

export default App
