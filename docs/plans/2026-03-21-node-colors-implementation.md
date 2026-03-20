# Node Color Customization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add ability to change node fill color and outline color from markdown definition using `{color=... outline=...}` syntax.

**Architecture:** Extend `TreeNode` type with optional `color` and `outlineColor` fields, modify parser to extract these from markdown attributes, update serializer to write them back, and pass through to React Flow nodes for inline style rendering.

**Tech Stack:** TypeScript, React, @xyflow/react, Vitest

---

### Task 1: Extend TypeScript Types

**Files:**
- Modify: `src/types/index.ts:1-44`

**Step 1: Add color fields to TreeNode**

```typescript
export interface TreeNode {
  id: string;
  text: string;
  level: number;
  parentId: string | null;
  children: string[];
  collapsed: boolean;
  color?: string;
  outlineColor?: string;
}
```

**Step 2: Add color fields to FlowNode data**

```typescript
export type FlowNode = {
  id: string;
  type: 'mindmap';
  position: { x: number; y: number };
  data: {
    label: string;
    hasChildren: boolean;
    collapsed: boolean;
    color?: string;
    outlineColor?: string;
  };
};
```

**Step 3: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "types: add color and outlineColor to TreeNode and FlowNode"
```

---

### Task 2: Implement Color Attribute Parsing in Parser

**Files:**
- Modify: `src/utils/parser.ts:1-49`
- Test: `src/utils/__tests__/parser.test.ts`

**Step 1: Write helper function to parse attributes**

Add at top of `parser.ts` before `parseMarkdownToTree`:

```typescript
/**
 * Parse color attributes from text like "Node name {color=red outline=#333}"
 * Returns the clean text and extracted attributes
 */
function parseNodeAttributes(text: string): {
  cleanText: string;
  color?: string;
  outlineColor?: string;
} {
  const attrMatch = text.match(/\{([^}]*)\}$/);
  if (!attrMatch) {
    return { cleanText: text };
  }

  const attrString = attrMatch[1];
  const cleanText = text.slice(0, -attrMatch[0].length).trim();

  const attrs: { color?: string; outlineColor?: string } = {};

  // Support both "color=red outline=blue" and "color: red; outline: blue;" formats
  const pairs = attrString.split(/[;\s]+/).filter(Boolean);

  for (const pair of pairs) {
    const match = pair.match(/^(color|outline):?=?(.+)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key === 'color') {
        attrs.color = value;
      } else if (key === 'outline') {
        attrs.outlineColor = value;
      }
    }
  }

  return { cleanText, ...attrs };
}
```

**Step 2: Modify parseMarkdownToTree to use the parser**

Replace line 18 (the `text` extraction) with:

```typescript
const rawText = match[2].trim();
const { cleanText: text, color, outlineColor } = parseNodeAttributes(rawText);
```

And add `color` and `outlineColor` to the node creation:

```typescript
const node: TreeNode = {
  id,
  text,
  level,
  parentId: null,
  children: [],
  collapsed: false,
  color,
  outlineColor,
};
```

**Step 3: Write parser tests**

Add to `src/utils/__tests__/parser.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseMarkdownToTree } from '../parser';

describe('parseMarkdownToTree', () => {
  it('parses nodes without attributes', () => {
    const markdown = '- Node 1';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.rootIds).toHaveLength(1);
    expect(result.nodes[result.rootIds[0]].text).toBe('Node 1');
    expect(result.nodes[result.rootIds[0]].color).toBeUndefined();
    expect(result.nodes[result.rootIds[0]].outlineColor).toBeUndefined();
  });

  it('parses color attribute with = format', () => {
    const markdown = '- Node 1 {color=red}';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].text).toBe('Node 1');
    expect(result.nodes[result.rootIds[0]].color).toBe('red');
  });

  it('parses both color and outline attributes', () => {
    const markdown = '- Node 1 {color=#ff5733 outline=#333333}';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].text).toBe('Node 1');
    expect(result.nodes[result.rootIds[0]].color).toBe('#ff5733');
    expect(result.nodes[result.rootIds[0]].outlineColor).toBe('#333333');
  });

  it('parses CSS variable colors', () => {
    const markdown = '- Node 1 {color=var(--accent)}';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].color).toBe('var(--accent)');
  });

  it('handles text with curly braces in the middle', () => {
    const markdown = '- Node {special} text';
    const result = parseMarkdownToTree(markdown);
    
    expect(result.nodes[result.rootIds[0]].text).toBe('Node {special} text');
  });

  it('parses nested nodes with attributes', () => {
    const markdown = `- Parent {color=blue}
  - Child {outline=red}`;
    const result = parseMarkdownToTree(markdown);
    
    const parent = result.nodes[result.rootIds[0]];
    expect(parent.color).toBe('blue');
    expect(parent.children).toHaveLength(1);
    
    const child = result.nodes[parent.children[0]];
    expect(child.outlineColor).toBe('red');
    expect(child.text).toBe('Child');
  });
});
```

**Step 4: Run tests**

Run: `npm test -- src/utils/__tests__/parser.test.ts`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/utils/parser.ts src/utils/__tests__/parser.test.ts
git commit -m "feat: parse color and outline attributes from markdown"
```

---

### Task 3: Update Serializer to Write Colors

**Files:**
- Modify: `src/utils/serializer.ts:1-23`

**Step 1: Modify treeToMarkdown to include attributes**

Replace the line `lines.push(`${spaces}- ${node.text}`)` with:

```typescript
let line = `${spaces}- ${node.text}`;

// Append color attributes if present
if (node.color || node.outlineColor) {
  const attrs: string[] = [];
  if (node.color) attrs.push(`color=${node.color}`);
  if (node.outlineColor) attrs.push(`outline=${node.outlineColor}`);
  line += ` {${attrs.join(' ')}}`;
}

lines.push(line);
```

**Step 2: Write serializer tests**

Create `src/utils/__tests__/serializer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { treeToMarkdown } from '../serializer';
import { TreeData } from '@/types';

describe('treeToMarkdown', () => {
  it('serializes tree without colors', () => {
    const tree: TreeData = {
      rootIds: ['node-0'],
      nodes: {
        'node-0': {
          id: 'node-0',
          text: 'Root',
          level: 0,
          parentId: null,
          children: [],
          collapsed: false,
        },
      },
    };

    expect(treeToMarkdown(tree)).toBe('- Root');
  });

  it('serializes tree with color', () => {
    const tree: TreeData = {
      rootIds: ['node-0'],
      nodes: {
        'node-0': {
          id: 'node-0',
          text: 'Root',
          level: 0,
          parentId: null,
          children: [],
          collapsed: false,
          color: 'red',
        },
      },
    };

    expect(treeToMarkdown(tree)).toBe('- Root {color=red}');
  });

  it('serializes tree with both colors', () => {
    const tree: TreeData = {
      rootIds: ['node-0'],
      nodes: {
        'node-0': {
          id: 'node-0',
          text: 'Root',
          level: 0,
          parentId: null,
          children: [],
          collapsed: false,
          color: '#ff5733',
          outlineColor: '#333',
        },
      },
    };

    expect(treeToMarkdown(tree)).toBe('- Root {color=#ff5733 outline=#333}');
  });

  it('round-trip: parse then serialize preserves colors', async () => {
    const { parseMarkdownToTree } = await import('../parser');
    const markdown = `- Root {color=blue}
  - Child {outline=red}`;
    
    const tree = parseMarkdownToTree(markdown);
    const serialized = treeToMarkdown(tree);
    
    expect(serialized).toBe(markdown);
  });
});
```

**Step 3: Run tests**

Run: `npm test -- src/utils/__tests__/serializer.test.ts`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/utils/serializer.ts src/utils/__tests__/serializer.test.ts
git commit -m "feat: serialize color and outline attributes to markdown"
```

---

### Task 4: Pass Colors to Flow Nodes

**Files:**
- Modify: `src/components/MindmapPanel/index.tsx`

**Step 1: Find where FlowNode data is created**

Locate the code that maps TreeNode to FlowNode (likely in a `useMemo` or helper function), and add color fields:

```typescript
data: {
  label: node.text,
  hasChildren: node.children.length > 0,
  collapsed: node.collapsed,
  color: node.color,
  outlineColor: node.outlineColor,
},
```

**Step 2: Run type check**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/components/MindmapPanel/index.tsx
git commit -m "feat: pass color attributes to flow nodes"
```

---

### Task 5: Render Colors in MindmapNode Component

**Files:**
- Modify: `src/components/MindmapPanel/MindmapNode.tsx:72-77`

**Step 1: Update node div to use inline styles for colors**

Replace the outer div with:

```tsx
<div 
  className={`mindmap-node ${selected ? 'selected' : ''}`} 
  onDoubleClick={handleDoubleClick}
  onContextMenu={handleContextMenu}
  style={{
    ...(data.color && { backgroundColor: data.color }),
    ...(data.outlineColor && { borderColor: data.outlineColor }),
  }}
>
```

**Step 2: Start dev server and test visually**

Run: `npm run dev`
Open browser at http://localhost:5173

Test markdown:
```markdown
- Root {color=#e3f2fd outline=#1976d2}
  - Child 1 {color=#fff3e0}
  - Child 2 {outline=#d32f2f}
  - Normal child
```

Verify:
- Root has light blue background and blue outline
- Child 1 has light orange background
- Child 2 has red outline
- Normal child uses default styling

**Step 3: Commit**

```bash
git add src/components/MindmapPanel/MindmapNode.tsx
git commit -m "feat: render node colors in mindmap nodes"
```

---

### Task 6: Verify Full Integration

**Files:**
- All modified files

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build with no errors

**Step 3: Final commit (if any uncommitted changes)**

```bash
git status
# If there are changes:
git add -A
git commit -m "feat: complete node color customization from markdown"
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `color` and `outlineColor` fields |
| `src/utils/parser.ts` | Parse `{color=... outline=...}` attributes |
| `src/utils/__tests__/parser.test.ts` | Add tests for attribute parsing |
| `src/utils/serializer.ts` | Write attributes back to markdown |
| `src/utils/__tests__/serializer.test.ts` | Add serializer tests |
| `src/components/MindmapPanel/index.tsx` | Pass colors to FlowNode data |
| `src/components/MindmapPanel/MindmapNode.tsx` | Apply colors via inline styles |

## Usage Examples

```markdown
- Simple node
- Red fill {color=red}
- Custom hex {color=#ff5733}
- Blue border {outline=#1976d2}
- Both colors {color=#e3f2fd outline=#1976d2}
- CSS variable {color=var(--accent)}
```
