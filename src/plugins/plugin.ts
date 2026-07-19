export interface WorkspaceProvider {
  /**
   * The name of the provider (e.g., 'tmux', 'none').
   */
  name: string;

  /**
   * Called when a new worktree is created.
   * Runs the specific multiplexer setup and returns arbitrary metadata to persist.
   * 
   * @param name The name of the new worktree.
   * @param path The absolute path to the worktree.
   * @returns Metadata that will be saved in state.json.
   */
  onCreate(name: string, path: string): Promise<any>;

  /**
   * Called when a worktree is deleted.
   * Uses the previously persisted metadata to clean up the multiplexer workspace.
   * 
   * @param name The name of the worktree being deleted.
   * @param path The absolute path to the worktree.
   * @param metadata The metadata that was returned by onCreate.
   */
  onDelete(name: string, path: string, metadata: any): Promise<void>;

  /**
   * Optional hook to format how this workspace is displayed in the list command.
   * 
   * @param metadata The persisted metadata.
   * @returns A string representing the details, or undefined if not supported.
   */
  getDisplayDetails?(metadata: any): string;

  /**
   * Optional hook to check if the workspace session/pane is still active.
   * 
   * @param metadata The persisted metadata.
   * @returns true if still active, false otherwise.
   */
  isValidSession?(metadata: any): boolean;
}
