import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import NotesList from './components/NotesList'
import MindmapPanel from './components/MindmapPanel'
import EditorPanel from './components/EditorPanel'
import ResizableDivider from './components/ResizableDivider'
import ThemeToggle from './components/ThemeToggle'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDebouncedCallback } from './hooks/useDebouncedCallback'
import { parseMarkdownToTree } from './utils/parser'
import { Note, NotesStorage } from './types'
import { Download, Upload } from 'lucide-react'
import './styles/App.css'

const DEFAULT_MARKDOWN = `- New Note
  - Item 1
  - Item 2`

const NOTES_STORAGE_KEY = 'mindmap-notes'

// Fallback for browsers that don't support crypto.randomUUID
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const createNewNote = (): Note => ({
  id: generateId(),
  title: 'Untitled Note',
  content: DEFAULT_MARKDOWN,
  collapsedNodes: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

function App() {
  const [storage, setStorage] = useLocalStorage<NotesStorage>(NOTES_STORAGE_KEY, {
    notes: [],
    activeNoteId: null,
  })
  
  // Use a ref to always have access to current storage in callbacks
  const storageRef = useRef(storage)
  storageRef.current = storage
  
  // Initialize with a default note if no notes exist
  useEffect(() => {
    if (storageRef.current.notes.length === 0) {
      const defaultNote = createNewNote()
      defaultNote.title = 'Welcome'
      defaultNote.content = `- Project Ideas
  - Mobile App
    - Fitness Tracker
    - Recipe Manager
  - Web Tool
    - Markdown Editor
    - API Dashboard
- Resources
  - Design Inspiration
  - Code Snippets`
      const newStorage = {
        notes: [defaultNote],
        activeNoteId: defaultNote.id,
      }
      setStorage(newStorage)
      storageRef.current = newStorage
    }
  }, [setStorage])
  
  const activeNote = useMemo(() => {
    return storage.notes.find(n => n.id === storage.activeNoteId) || null
  }, [storage])
  
  const [editorHeight, setEditorHeight] = useState<number>(40)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(
    new Set(activeNote?.collapsedNodes || [])
  )
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  
  // Update collapsed nodes when active note changes
  useEffect(() => {
    if (activeNote) {
      setCollapsedNodes(new Set(activeNote.collapsedNodes))
    }
  }, [activeNote?.id])
  
  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])
  
  const markdown = activeNote?.content || ''
  const treeData = useMemo(() => parseMarkdownToTree(markdown), [markdown])
  
  // Auto-save note changes - update note in storage
  const debouncedSave = useDebouncedCallback((note: Note) => {
    const current = storageRef.current
    setStorage({
      ...current,
      notes: current.notes.map(n => n.id === note.id ? note : n),
    })
  }, 500)
  
  const updateActiveNote = useCallback((updates: Partial<Note>) => {
    if (!activeNote) return
    const updatedNote = { ...activeNote, ...updates, updatedAt: Date.now() }
    debouncedSave(updatedNote)
  }, [activeNote, debouncedSave])
  
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    updateActiveNote({ content: newMarkdown })
  }, [updateActiveNote])

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
      // Save collapsed state to active note
      updateActiveNote({ collapsedNodes: Array.from(next) })
      return next
    })
  }, [updateActiveNote])
  
  const handleCreateNote = useCallback(() => {
    const newNote = createNewNote()
    const current = storageRef.current
    setStorage({
      notes: [...current.notes, newNote],
      activeNoteId: newNote.id,
    })
  }, [setStorage])
  
  const handleSelectNote = useCallback((noteId: string) => {
    const current = storageRef.current
    setStorage({ ...current, activeNoteId: noteId })
  }, [setStorage])
  
  const handleDeleteNote = useCallback((noteId: string) => {
    const current = storageRef.current
    const newNotes = current.notes.filter(n => n.id !== noteId)
    setStorage({
      notes: newNotes,
      activeNoteId: current.activeNoteId === noteId 
        ? (newNotes[0]?.id || null) 
        : current.activeNoteId,
    })
  }, [setStorage])
  
  const handleUpdateNoteTitle = useCallback((noteId: string, title: string) => {
    const current = storageRef.current
    setStorage({
      ...current,
      notes: current.notes.map(n => 
        n.id === noteId ? { ...n, title, updatedAt: Date.now() } : n
      ),
    })
  }, [setStorage])
  
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

  // Export current note as markdown file
  const handleExport = useCallback(() => {
    if (!activeNote) return
    
    const blob = new Blob([activeNote.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [activeNote])

  // Import markdown file
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (content) {
          const newNote = createNewNote()
          newNote.title = file.name.replace(/\.[^/.]+$/, '') // Remove extension
          newNote.content = content
          
          const current = storageRef.current
          setStorage({
            notes: [...current.notes, newNote],
            activeNoteId: newNote.id,
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [setStorage])

  return (
    <div className="app">
      <NotesList
        notes={storage.notes}
        activeNoteId={storage.activeNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onUpdateNoteTitle={handleUpdateNoteTitle}
      />
      <div className="app-main-container">
        <header className="app-header">
          <h1>{activeNote?.title || 'Mindmap Markdown Editor'}</h1>
          <div className="header-actions">
            <button
              className="header-btn"
              onClick={handleExport}
              disabled={!activeNote}
              title="Export as Markdown"
              aria-label="Export as Markdown"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
            <button
              className="header-btn"
              onClick={handleImport}
              title="Import Markdown File"
              aria-label="Import Markdown File"
            >
              <Upload size={18} />
              <span>Import</span>
            </button>
            <ThemeToggle isDark={isDarkMode} onToggle={handleThemeToggle} />
          </div>
        </header>
        <main className="app-main">
          <div style={{ height: `${100 - editorHeight}%`, display: 'flex' }}>
            <MindmapPanel 
              treeData={treeData}
              collapsedNodes={collapsedNodes}
              onNodeClick={handleNodeClick}
              onNodeCollapse={handleNodeCollapse}
            />
          </div>
          <ResizableDivider onResize={handleResize} />
          <div style={{ height: `${editorHeight}%`, display: 'flex' }}>
            <EditorPanel 
              value={markdown}
              onChange={handleMarkdownChange}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
