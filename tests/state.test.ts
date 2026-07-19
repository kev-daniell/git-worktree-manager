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
    const testPath = path.join(MOCK_CONFIG_DIR, 'test-wt');
    const worktrees: Worktree[] = [{ name: 'test-wt', path: testPath, workspace: { provider: 'none', metadata: { session: 'test-wt', windowId: 1 } } }];
    writeState(worktrees);
    
    expect(fs.existsSync(STATE_FILE_PATH)).toBe(true);
    const content = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    expect(JSON.parse(content)).toEqual(worktrees);
  });

  it('readState should correctly read a populated state file', () => {
    const testPath = path.join(MOCK_CONFIG_DIR, 'test-read');
    fs.mkdirSync(testPath, { recursive: true });
    const worktrees: Worktree[] = [{ name: 'test-read', path: testPath, workspace: { provider: 'none', metadata: { session: 'test-read', windowId: 1 } } }];
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(worktrees));

    const state = readState();
    expect(state).toEqual(worktrees);
  });

  it('addWorktree should add a new worktree to the state', () => {
    writeState([]); // Start with a clean slate
    const testPath = path.join(MOCK_CONFIG_DIR, 'add-me');
    fs.mkdirSync(testPath, { recursive: true });
    const newWorktree: Worktree = { name: 'add-me', path: testPath, workspace: { provider: 'none', metadata: { session: 'add-me', windowId: 1 } } };
    addWorktree(newWorktree);

    const state = readState();
    expect(state).toHaveLength(1);
    expect(state[0]).toEqual(newWorktree);
  });

  it('removeWorktree should remove an existing worktree from the state', () => {
    const keepPath = path.join(MOCK_CONFIG_DIR, 'keep-me');
    const removePath = path.join(MOCK_CONFIG_DIR, 'remove-me');
    fs.mkdirSync(keepPath, { recursive: true });
    fs.mkdirSync(removePath, { recursive: true });
    const initialWorktrees: Worktree[] = [
      { name: 'keep-me', path: keepPath, workspace: { provider: 'none', metadata: { session: 'keep-me', windowId: 1 } } },
      { name: 'remove-me', path: removePath, workspace: { provider: 'none', metadata: { session: 'remove-me', windowId: 1 } } },
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

  it('readState should prune worktrees whose directory does not exist', () => {
    const validPath = path.join(MOCK_CONFIG_DIR, 'valid-dir');
    const invalidPath = path.join(MOCK_CONFIG_DIR, 'non-existent-dir');
    fs.mkdirSync(validPath, { recursive: true });
    
    const worktrees: Worktree[] = [
      { name: 'valid', path: validPath, workspace: { provider: 'none', metadata: {} } },
      { name: 'invalid', path: invalidPath, workspace: { provider: 'none', metadata: {} } }
    ];
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(worktrees));

    const state = readState();
    expect(state).toHaveLength(1);
    expect(state[0].name).toBe('valid');
  });

  it('readState should clear stale workspaces if the provider reports it as invalid', () => {
    const testPath = path.join(MOCK_CONFIG_DIR, 'test-stale');
    fs.mkdirSync(testPath, { recursive: true });
    
    const worktrees: Worktree[] = [
      { name: 'test-stale', path: testPath, workspace: { provider: 'tmux', metadata: { session: 'stale-session', windowId: 999 } } }
    ];
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(worktrees));

    const state = readState();
    expect(state).toHaveLength(1);
    expect(state[0].workspace).toBeUndefined();
  });
});
