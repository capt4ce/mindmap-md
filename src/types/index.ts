export interface TreeNode {
  id: string;
  text: string;
  level: number;
  parentId: string | null;
  children: string[];
  collapsed: boolean;
}

export interface TreeData {
  nodes: Record<string, TreeNode>;
  rootIds: string[];
}

export type FlowNode = {
  id: string;
  type: 'mindmap';
  position: { x: number; y: number };
  data: {
    label: string;
    hasChildren: boolean;
    collapsed: boolean;
  };
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
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
