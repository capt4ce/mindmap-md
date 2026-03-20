# Node Color Customization Design

**Date:** 2026-03-21  
**Topic:** Add ability to change node fill color and outline color from markdown definition

## Overview

Allow users to customize the visual appearance of mindmap nodes by specifying colors directly in the markdown source using an inline attribute syntax: `{color=red outline=#333}`.

## Goals

- Parse color attributes from markdown node definitions
- Store color metadata in the tree structure
- Render nodes with custom colors in the mindmap view
- Serialize colors back to markdown when saving

## Non-Goals

- Gradient backgrounds or complex styling
- Per-edge color customization
- Color picker UI (this is markdown-driven)

## Design

### 1. Data Model Changes

Extend `TreeNode` and `FlowNode.data` to include optional color properties:

```typescript
// src/types/index.ts
export interface TreeNode {
  id: string;
  text: string;
  level: number;
  parentId: string | null;
  children: string[];
  collapsed: boolean;
  color?: string;          // NEW: fill color (hex, rgb, css var, named color)
  outlineColor?: string;   // NEW: border/outline color
}

export type FlowNode = {
  id: string;
  type: 'mindmap';
  position: { x: number; y: number };
  data: {
    label: string;
    hasChildren: boolean;
    collapsed: boolean;
    color?: string;        // NEW
    outlineColor?: string; // NEW
  };
};
```

### 2. Parser Changes (`src/utils/parser.ts`)

Modify the line parsing to detect and extract `{...}` attribute blocks from the end of node text.

**Parsing approach:**
1. Match trailing `{...}` block with regex `/\{([^}]*)\}$/`
2. Parse key-value pairs from inside the braces
3. Support formats: `color=red`, `color:red`, `color: red;`
4. Remove the attribute block from the text

**Supported syntax examples:**
```markdown
- Normal node
- Red node {color=red}
- Styled node {color=#ff5733 outline=#333}
- CSS variable {color=var(--accent)}
- Alternative format {color: blue; outline: red;}
```

### 3. Serializer Changes (`src/utils/serializer.ts`)

When converting tree back to markdown:
- If `color` or `outlineColor` exists, append `{color=X outline=Y}`
- Only include defined attributes
- Use `=` format consistently

### 4. Node Rendering (`src/components/MindmapPanel/MindmapNode.tsx`)

Apply colors via inline styles that override CSS variables:

```tsx
<div 
  className="mindmap-node"
  style={{
    ...(data.color && { backgroundColor: data.color }),
    ...(data.outlineColor && { borderColor: data.outlineColor })
  }}
>
```

### 5. Flow Node Generation (`src/components/MindmapPanel/index.tsx`)

When creating `FlowNode` objects from `TreeNode`, pass through the color properties to `data`.

## Testing Considerations

- Parser tests for various attribute formats
- Serializer round-trip tests (parse → serialize → should match)
- Node rendering with colors
- Backward compatibility (nodes without colors should use defaults)

## Future Extensions

- Font color attribute
- Border width/style attributes
- Predefined CSS class shortcuts: `{.urgent}`, `{.completed}`
