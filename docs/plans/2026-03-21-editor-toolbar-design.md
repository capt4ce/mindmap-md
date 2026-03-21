# Editor Toolbar Design

**Date:** 2026-03-21  
**Topic:** Add toolbar for common operations (undo, redo, bold, italic, underline, color, outline color)

## Overview

Add a feature-rich toolbar to the EditorPanel that provides WYSIWYG-style text formatting and node color controls while maintaining markdown as the underlying format.

## Goals

- Provide undo/redo functionality with keyboard shortcuts
- Enable WYSIWYG text formatting (bold, italic, underline) with active state feedback
- Allow quick application of node colors (fill and outline) via presets and custom picker
- Maintain clean separation between toolbar and editor logic

## Non-Goals

- Full rich-text editor replacement
- Table/formula insertion
- Image upload/handling
- Font size/family changes

## Design

### 1. Architecture Overview

The toolbar will be a new `EditorToolbar` component that sits between the existing toolbar title and the textarea. It maintains its own state for:
- **History stack** for undo/redo (text snapshots)
- **Active format states** (bold, italic, underline) based on cursor position
- **Color picker visibility**

The toolbar communicates with the editor via callback props: `onUndo`, `onRedo`, `onFormat`, `onApplyColor`.

### 2. Component Structure

```
EditorPanel
├── EditorToolbar (NEW)
│   ├── Undo/Redo buttons
│   ├── Separator
│   ├── Bold, Italic, Underline buttons (toggle style)
│   ├── Separator  
│   ├── Color presets (swatches)
│   ├── Outline color presets
│   └── Custom color picker button
└── textarea (enhanced with history tracking)
```

**File layout:**
- `src/components/EditorToolbar/index.tsx` - Main toolbar component
- `src/components/EditorToolbar/styles.css` - Toolbar styling
- Modify: `src/components/EditorPanel/index.tsx` - Integrate toolbar

### 3. Undo/Redo System

Use a simple history stack approach:
- Store array of text states
- Pointer to current position in history
- Max 50 entries to prevent memory bloat
- Ctrl+Z / Ctrl+Y keyboard shortcuts
- Disable buttons when at boundaries

### 4. Text Formatting (WYSIWYG)

**Active State Detection:**
When cursor moves, parse the current line's markdown to detect:
- `**text**` or `__text__` → Bold active
- `*text*` or `_text_` → Italic active  
- `<u>text</u>` → Underline active

**Implementation:**
- On cursor position change: Check surrounding text for markdown syntax
- Update toolbar button states (pressed/highlighted)
- Clicking a button toggles the format:
  - If active: remove the syntax wrapper
  - If inactive: wrap selection (or insert empty wrapper at cursor)

**Underline:** Use HTML `<u>...</u>` syntax (no standard markdown underline)

### 5. Node Colors

**Preset Swatches:** Show 6-8 common colors (red, blue, green, yellow, purple, orange, gray, black)

**Behavior:**
- Click a fill color swatch → adds/modifies `{color=X}` on current line
- Click an outline color swatch → adds/modifies `{outline=X}` on current line
- Click "custom" → opens browser native color picker

**Visual Feedback:**
- Swatches show current line's colors (if any)
- Active colors highlighted

### 6. Data Flow

```
User clicks toolbar button
        ↓
EditorToolbar calls onAction callback
        ↓
EditorPanel updates localValue + history
        ↓
EditorPanel calls onChange prop
        ↓
Parent updates markdown
        ↓
Mindmap re-renders with new colors
```

### 7. API Design

**EditorToolbar Props:**
```typescript
interface EditorToolbarProps {
  canUndo: boolean
  canRedo: boolean
  activeFormats: { bold: boolean; italic: boolean; underline: boolean }
  currentLineColors: { color?: string; outlineColor?: string }
  onUndo: () => void
  onRedo: () => void
  onFormat: (format: 'bold' | 'italic' | 'underline') => void
  onApplyColor: (type: 'color' | 'outlineColor', value: string) => void
}
```

### 8. Styling

- Toolbar: horizontal flex layout, light background, subtle border
- Buttons: icon-based (Lucide icons), 32x32px, hover states
- Active format buttons: highlighted/pressed state
- Color swatches: 20x20px circles, selected state with ring
- Dark mode support via CSS variables

## Usage Examples

### Text Formatting
1. Select text "important"
2. Click Bold button → text becomes `**important**`
3. Bold button shows active state
4. Click Bold again → text becomes `important`

### Node Colors
1. Place cursor on line `- My Node`
2. Click red color swatch → line becomes `- My Node {color=red}`
3. Mindmap node immediately shows red background

## Testing Considerations

- History stack behavior (push on change, undo/redo navigation)
- Format detection at various cursor positions
- Format toggle (wrap/unwrap)
- Color application to current line
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+B, Ctrl+I, Ctrl+U)
