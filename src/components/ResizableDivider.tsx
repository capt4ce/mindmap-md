import { useRef, useCallback } from 'react'
import './ResizableDivider.css'

interface ResizableDividerProps {
  onResize: (delta: number) => void
}

export default function ResizableDivider({ onResize }: ResizableDividerProps) {
  const isDragging = useRef(false)
  const startY = useRef(0)
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    startY.current = e.clientY
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [])
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return
    const delta = startY.current - e.clientY
    startY.current = e.clientY
    onResize(delta)
  }, [onResize])
  
  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])
  
  const attachListeners = useCallback(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove, handleMouseUp])
  
  const detachListeners = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove, handleMouseUp])
  
  return (
    <div
      className="resizable-divider"
      onMouseDown={(e) => {
        handleMouseDown(e)
        attachListeners()
      }}
      onMouseUp={detachListeners}
      onMouseLeave={detachListeners}
      title="Drag to resize"
    />
  )
}
