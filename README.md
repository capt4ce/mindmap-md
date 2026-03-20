# Mindmap Markdown Editor

A React application that visualizes markdown bullet lists as interactive mindmaps.

## Features

- **Dual-pane layout**: Mindmap visualization on top, Markdown editor on bottom
- **Two-way sync**: Edit in either view, changes reflect immediately
- **Interactive mindmap**: Click to collapse/expand, right-click for actions
- **Node actions**: Add child, add sibling, edit text, delete nodes
- **Resizable panels**: Drag divider to adjust panel sizes
- **Dark/Light theme**: Toggle with persistent preference
- **Auto-save**: All changes saved to localStorage

## Tech Stack

- React 18 + TypeScript
- Vite
- Milkdown (ProseMirror-based editor)
- React Flow (mindmap visualization)
- CSS Modules

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Usage

1. Type markdown bullet lists in the editor
2. See them visualized as a mindmap above
3. Right-click nodes for actions
4. Click chevron to collapse/expand branches
5. Toggle theme in the header
6. All changes auto-save
