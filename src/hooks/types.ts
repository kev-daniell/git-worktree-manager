export type HookEvent = 'pre-create' | 'post-create' | 'pre-delete' | 'post-delete';

export interface HookContext {
  eventName: HookEvent;
  worktreeName: string;
  worktreePath: string;
  projectRoot: string;
  baseBranch?: string;
  workspaceProvider?: string;
}

export interface HookConfig {
  event: HookEvent;
  command?: string;
  scriptPath?: string;
  source: 'project' | 'global';
}
