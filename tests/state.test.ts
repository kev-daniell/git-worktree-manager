import { describe, beforeEach, afterAll, it, expect, mock } from 'bun:test';
import fs from 'fs';
import path from 'path';
import os from 'os';

mock.module('../src/config', () => ({
  STATE_FILE_PATH: path.join(os.tmpdir(), 'wtmg-jest-tests', 'state.json'),
}));

import { readState, writeState, addWorktree, removeWorktree } from '../src/state';
import { STATE_FILE_PATH } from '../src/config';
import { Worktree } from '../src/types';

const MOCK_CONFIG_DIR = path.dirname(STATE_FILE_PATH);

describe('State Management', () => {
  beforeEach(() => {
    fs.rmSync(MOCK_CONFIG_DIR, { recursive: true, force: true });
    fs.mkdirSync(MOCK_CONFIG_DIR, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(MOCK_CONFIG_DIR, { recursive: true, force: true });
  });

  it('readState should return an empty array if state file does not exist', () => {
    const state = readState();
    expect(state).toEqual([]);
  });

  it('writeState should create a directory and write the state file', () => {
    const worktrees: Worktree[] = [{ name: 'test-wt', path: '/path/to/test-wt', workspace: { provider: 'tmux', metadata: { session: 'test-wt', windowId: 1 } } }];
    writeState(worktrees);
    
    expect(fs.existsSync(STATE_FILE_PATH)).toBe(true);
    const content = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    expect(JSON.parse(content)).toEqual(worktrees);
  });

  it('readState should correctly read a populated state file', () => {
    const worktrees: Worktree[] = [{ name: 'test-read', path: '/path/to/test-read', workspace: { provider: 'tmux', metadata: { session: 'test-read', windowId: 1 } } }];
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(worktrees));

    const state = readState();
    expect(state).toEqual(worktrees);
  });

  it('addWorktree should add a new worktree to the state', () => {
    writeState([]); // Start with a clean slate
    const newWorktree: Worktree = { name: 'add-me', path: '/path/to/add-me', workspace: { provider: 'tmux', metadata: { session: 'add-me', windowId: 1 } } };
    addWorktree(newWorktree);

    const state = readState();
    expect(state).toHaveLength(1);
    expect(state[0]).toEqual(newWorktree);
  });

  it('removeWorktree should remove an existing worktree from the state', () => {
    const initialWorktrees: Worktree[] = [
      { name: 'keep-me', path: '/path/to/keep-me', workspace: { provider: 'tmux', metadata: { session: 'keep-me', windowId: 1 } } },
      { name: 'remove-me', path: '/path/to/remove-me', workspace: { provider: 'tmux', metadata: { session: 'remove-me', windowId: 1 } } },
    ];
    writeState(initialWorktrees);

    removeWorktree('remove-me');

    const state = readState();
    expect(state).toHaveLength(1);
    expect(state[0]).toEqual(initialWorktrees[0]);
  });

  it('readState should handle a corrupted JSON file gracefully', () => {
    fs.writeFileSync(STATE_FILE_PATH, 'this is not json');
    const state = readState();
    expect(state).toEqual([]);
  });
});
