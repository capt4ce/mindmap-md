import { useMemo } from 'react'
import { X, Tag } from 'lucide-react'
import { TreeData } from '@/types'
import './TagFilter.css'

interface TagFilterProps {
  treeData: TreeData
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
}

export function TagFilter({ treeData, selectedTags, onTagToggle, onClearFilters }: TagFilterProps) {
  // Extract all unique tags from the tree
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const node of Object.values(treeData.nodes)) {
      for (const tag of node.tags) {
        tagSet.add(tag)
      }
    }
    return Array.from(tagSet).sort()
  }, [treeData])

  if (allTags.length === 0) {
    return null
  }

  // Generate a consistent color for a tag
  const getTagColor = (tag: string): string => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
    ]
    let hash = 0
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="tag-filter">
      <div className="tag-filter-header">
        <Tag size={14} className="tag-filter-icon" />
        <span className="tag-filter-title">Filter by tags</span>
        {selectedTags.length > 0 && (
          <button className="tag-filter-clear" onClick={onClearFilters} title="Clear all filters">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="tag-filter-list">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              className={`tag-filter-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onTagToggle(tag)}
              style={{
                '--tag-color': getTagColor(tag),
              } as React.CSSProperties}
              title={isSelected ? `Remove filter: ${tag}` : `Filter by: ${tag}`}
            >
              {tag}
            </button>
          )
        })}
      </div>
      {selectedTags.length > 0 && (
        <div className="tag-filter-active">
          Showing nodes with {selectedTags.length === 1 ? 'tag' : 'all tags'}: {selectedTags.join(' + ')}
        </div>
      )}
    </div>
  )
}
