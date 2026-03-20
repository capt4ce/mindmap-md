import { useState, useMemo, useCallback, useEffect } from 'react'
import MindmapPanel from './components/MindmapPanel'
import EditorPanel from './components/EditorPanel'
import ResizableDivider from './components/ResizableDivider'
import ThemeToggle from './components/ThemeToggle'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDebouncedCallback } from './hooks/useDebouncedCallback'
import { parseMarkdownToTree } from './utils/parser'
import { treeToMarkdown } from './utils/serializer'
import { updateNodeInMarkdown } from './utils/markdown'
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

const STORAGE_KEY = 'mindmap-markdown-editor'

interface StoredData {
  markdown: string
  collapsedNodes: string[]
  editorHeight: number
  isDarkMode: boolean
}

function App() {
  const [storedData, setStoredData] = useLocalStorage<StoredData>(STORAGE_KEY, {
    markdown: DEFAULT_MARKDOWN,
    collapsedNodes: [],
    editorHeight: 40,
    isDarkMode: false,
  })
  
  const [markdown, setMarkdown] = useState<string>(storedData.markdown)
  const [editorHeight, setEditorHeight] = useState<number>(storedData.editorHeight)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(
    new Set(storedData.collapsedNodes)
  )
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storedData.isDarkMode)
  
  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])
  
  const treeData = useMemo(() => parseMarkdownToTree(markdown), [markdown])
  
  const debouncedSave = useDebouncedCallback((data: StoredData) => {
    setStoredData(data)
  }, 1000)
  
  useEffect(() => {
    debouncedSave({
      markdown,
      collapsedNodes: Array.from(collapsedNodes),
      editorHeight,
      isDarkMode,
    })
  }, [markdown, collapsedNodes, editorHeight, isDarkMode, debouncedSave])
  
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
  
  const handleNodeAction = useCallback((action: 'addChild' | 'addSibling' | 'delete' | 'edit', nodeId: string) => {
    const tree = { 
      nodes: { ...treeData.nodes }, 
      rootIds: [...treeData.rootIds] 
    }
    const node = tree.nodes[nodeId]
    if (!node) return
    
    switch (action) {
      case 'addChild': {
        const newId = `node-${Date.now()}`
        tree.nodes[newId] = {
          id: newId,
          text: 'New item',
          level: node.level + 1,
          parentId: nodeId,
          children: [],
          collapsed: false,
        }
        tree.nodes[nodeId].children.push(newId)
        break
      }
      case 'addSibling': {
        if (!node.parentId) {
          const newId = `node-${Date.now()}`
          tree.nodes[newId] = {
            id: newId,
            text: 'New item',
            level: 0,
            parentId: null,
            children: [],
            collapsed: false,
          }
          tree.rootIds.push(newId)
        } else {
          const parent = tree.nodes[node.parentId]
          const index = parent.children.indexOf(nodeId)
          const newId = `node-${Date.now()}`
          tree.nodes[newId] = {
            id: newId,
            text: 'New item',
            level: node.level,
            parentId: node.parentId,
            children: [],
            collapsed: false,
          }
          parent.children.splice(index + 1, 0, newId)
        }
        break
      }
      case 'delete': {
        if (node.parentId) {
          const parent = tree.nodes[node.parentId]
          parent.children = parent.children.filter(id => id !== nodeId)
        } else {
          tree.rootIds = tree.rootIds.filter(id => id !== nodeId)
        }
        const toRemove = [nodeId]
        const collectDescendants = (id: string) => {
          const n = tree.nodes[id]
          for (const childId of n.children) {
            toRemove.push(childId)
            collectDescendants(childId)
          }
        }
        collectDescendants(nodeId)
        for (const id of toRemove) {
          delete tree.nodes[id]
        }
        break
      }
      case 'edit': {
        const newText = prompt('Edit text:', node.text)
        if (newText !== null && newText.trim()) {
          tree.nodes[nodeId].text = newText.trim()
        }
        break
      }
    }
    
    const newMarkdown = treeToMarkdown(tree)
    setMarkdown(newMarkdown)
  }, [treeData])
  
  const handleNodeEdit = useCallback((nodeId: string, newLabel: string) => {
    setMarkdown(prevMarkdown => {
      return updateNodeInMarkdown(prevMarkdown, nodeId, newLabel, treeData)
    })
  }, [treeData])
  
  const handleResize = useCallback((delta: number) => {
    setEditorHeight(prev => {
      const containerHeight = window.innerHeight - 48
      const pixelHeight = (prev / 100) * containerHeight
      const newPixelHeight = pixelHeight + delta
      const newPercent = (newPixelHeight / containerHeight) * 100
      return Math.max(15, Math.min(70, newPercent))
    })
  }, [])
  
  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mindmap Markdown Editor</h1>
        <ThemeToggle isDark={isDarkMode} onToggle={handleThemeToggle} />
      </header>
      <main className="app-main">
        <div style={{ height: `${100 - editorHeight}%` }}>
          <MindmapPanel 
            treeData={treeData}
            collapsedNodes={collapsedNodes}
            onNodeClick={handleNodeClick}
            onNodeCollapse={handleNodeCollapse}
            onNodeEdit={handleNodeEdit}
            onNodeAction={handleNodeAction}
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
