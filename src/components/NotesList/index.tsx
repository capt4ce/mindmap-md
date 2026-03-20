import { useState, useCallback } from 'react'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { Note } from '@/types'
import './styles.css'

interface NotesListProps {
  notes: Note[]
  activeNoteId: string | null
  onSelectNote: (noteId: string) => void
  onCreateNote: () => void
  onDeleteNote: (noteId: string) => void
  onUpdateNoteTitle: (noteId: string, title: string) => void
}

export default function NotesList({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onUpdateNoteTitle,
}: NotesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDoubleClick = useCallback((note: Note) => {
    setEditingId(note.id)
    setEditTitle(note.title)
  }, [])

  const handleTitleSave = useCallback(() => {
    if (editingId && editTitle.trim()) {
      onUpdateNoteTitle(editingId, editTitle.trim())
    }
    setEditingId(null)
  }, [editingId, editTitle, onUpdateNoteTitle])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }, [handleTitleSave])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="notes-list">
      <div className="notes-list-header">
        <h2 className="notes-list-title">Notes</h2>
        <button 
          className="new-note-btn"
          onClick={onCreateNote}
          title="Create new note"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="notes-list-content">
        {notes.length === 0 ? (
          <div className="notes-empty">
            <p>No notes yet.</p>
            <p>Click + to create one.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
              onClick={() => onSelectNote(note.id)}
            >
              <FileText size={16} className="note-icon" />
              
              <div className="note-content">
                {editingId === note.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleKeyDown}
                    className="note-title-input"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span 
                    className="note-title"
                    onDoubleClick={() => handleDoubleClick(note)}
                    title="Double-click to rename"
                  >
                    {note.title}
                  </span>
                )}
                <span className="note-date">{formatDate(note.updatedAt)}</span>
              </div>

              <button
                className="note-delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteConfirmId(note.id)
                }}
                title="Delete note"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <h3>Delete Note?</h3>
            <p>This will permanently delete this note. This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button 
                className="btn-cancel"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-delete"
                onClick={() => {
                  onDeleteNote(deleteConfirmId)
                  setDeleteConfirmId(null)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
