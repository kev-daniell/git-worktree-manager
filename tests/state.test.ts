/// <reference types="jest" />

import fs from 'fs';
import path from 'path';
import os from 'os';
import { Worktree } from '../src/types';

// Mock the config module to point our state file to a temporary directory
jest.mock('../src/config', () => ({
  __esModule: true,
  ...jest.requireActual('../src/config'),
  STATE_FILE_PATH: path.join(os.tmpdir(), 'wt-mgr-jest-tests', 'state.json'),
}));

// Import the functions to test *after* the mock is defined
import { readState, writeState, addWorktree, removeWorktree } from '../src/state';
import { STATE_FILE_PATH } from '../src/config';

const MOCK_CONFIG_DIR = path.dirname(STATE_FILE_PATH);

describe('State Management', () => {
  // Clean up the mock directory before and after tests
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
    const worktrees: Worktree[] = [{ name: 'test-wt', path: '/path/to/test-wt', tmuxSession: 'test-wt' }];
    writeState(worktrees);
    
    expect(fs.existsSync(STATE_FILE_PATH)).toBe(true);
    const content = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    expect(JSON.parse(content)).toEqual(worktrees);
  });

  it('readState should correctly read a populated state file', () => {
    const worktrees: Worktree[] = [{ name: 'test-read', path: '/path/to/test-read', tmuxSession: 'test-read' }];
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(worktrees));

    const state = readState();
    expect(state).toEqual(worktrees);
  });

  it('addWorktree should add a new worktree to the state', () => {
    writeState([]); // Start with a clean slate
    const newWorktree: Worktree = { name: 'add-me', path: '/path/to/add-me', tmuxSession: 'add-me' };
    addWorktree(newWorktree);

    const state = readState();
    expect(state).toHaveLength(1);
    expect(state[0]).toEqual(newWorktree);
  });

  it('removeWorktree should remove an existing worktree from the state', () => {
    const initialWorktrees: Worktree[] = [
      { name: 'keep-me', path: '/path/to/keep-me', tmuxSession: 'keep-me' },
      { name: 'remove-me', path: '/path/to/remove-me', tmuxSession: 'remove-me' },
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
