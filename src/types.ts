export interface Worktree {
  name: string;
  path: string;
  tmux?: {
    session: string;
    windowId: number;
  };
}
