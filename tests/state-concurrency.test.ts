import { describe, afterAll, it, expect } from 'bun:test';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Child processes resolve STATE_FILE_PATH from HOME, so point HOME at a temp dir.
const MOCK_HOME = path.join(os.tmpdir(), 'wtmg-concurrency-tests');
const STATE_FILE = path.join(MOCK_HOME, '.config', 'wtmg', 'state.json');
const STATE_MODULE = path.resolve(__dirname, '../src/state');

function addInChildProcess(name: string, startAt: number): Promise<number | null> {
  const wtPath = path.join(MOCK_HOME, name);
  fs.mkdirSync(wtPath, { recursive: true });
  // Load the module, then busy-wait so every child hits the state file at the same moment
  const script = `const { addWorktree } = require(${JSON.stringify(STATE_MODULE)});
    while (Date.now() < ${startAt}) {}
    addWorktree(${JSON.stringify({ name, path: wtPath })});`;
  return new Promise((resolve) => {
    spawn(process.execPath, ['-e', script], { env: { ...process.env, HOME: MOCK_HOME }, stdio: 'ignore' })
      .on('exit', resolve);
  });
}

describe('State Concurrency', () => {
  afterAll(() => {
    fs.rmSync(MOCK_HOME, { recursive: true, force: true });
  });

  it('concurrent addWorktree calls should not lose entries', async () => {
    fs.rmSync(MOCK_HOME, { recursive: true, force: true });
    const names = Array.from({ length: 8 }, (_, i) => `wt-${i}`);
    const startAt = Date.now() + 1_000;

    const exitCodes = await Promise.all(names.map(name => addInChildProcess(name, startAt)));

    expect(exitCodes.every(code => code === 0)).toBe(true);
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as { name: string }[];
    expect(state.map(wt => wt.name).sort()).toEqual(names);
    expect(fs.existsSync(`${STATE_FILE}.lock`)).toBe(false);
  }, 30_000);
});
