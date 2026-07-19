export interface WorkspaceState {
  provider: string;
  metadata: any;
}

export interface Worktree {
  name: string;
  path: string;
  workspace?: WorkspaceState;
}
