export interface WorkspaceState {
  provider: string;
  metadata: any;
}

export interface Worktree {
  name: string;
  path: string;
  workspace?: WorkspaceState;
  
  // Legacy field, kept only for backwards compatibility during state loading
  tmux?: {
    session: string;
    windowId: number;
  };
}
