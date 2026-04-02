export interface TreeNode {
  id: string;
  text: string;
  level: number;
  parentId: string | null;
  rootId: string;
  children: string[];
  collapsed: boolean;
  color?: string;
  outlineColor?: string;
  edgeName?: string; // Name of the edge from parent to this node
  tags: string[]; // Tags extracted from text like #work #personal
}

export interface RootConfig {
  id: string;
  horizontalSpacing?: number;
  verticalSpacing?: number;
}

export interface TreeData {
  nodes: Record<string, TreeNode>;
  rootIds: string[];
  rootConfigs?: Record<string, RootConfig>;
}

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
    tags: string[];
  };
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

// Edge group node for visual grouping of edges with same name
export type EdgeGroupNode = {
  id: string;
  type: 'edgeGroup';
  position: { x: number; y: number };
  data: {
    label: string;
    sourceId: string;
    targetIds: string[];
  };
};

export interface Note {
  id: string;
  title: string;
  content: string;
  collapsedNodes: string[];
  createdAt: number;
  updatedAt: number;
}

export interface NotesStorage {
  notes: Note[];
  activeNoteId: string | null;
}
