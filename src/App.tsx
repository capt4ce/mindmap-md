import { useState } from 'react'
import './styles/App.css'

function App() {
  const [markdown, setMarkdown] = useState<string>(`- Project Ideas
  - Mobile App
    - Fitness Tracker
  - Web Tool
    - Markdown Editor`)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mindmap Markdown Editor</h1>
      </header>
      <main className="app-main">
        <div className="panel mindmap-panel">
          <p>Mindmap Panel (React Flow)</p>
        </div>
        <div className="divider" />
        <div className="panel editor-panel">
          <p>Editor Panel (Milkdown)</p>
        </div>
      </main>
    </div>
  )
}

export default App
