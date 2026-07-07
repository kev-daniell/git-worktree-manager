# wt-mgr

A simple CLI tool to streamline the management of Git worktrees and associated tmux sessions.
It automates the tedious process of creating a worktree, a new branch, and a new tmux session,
allowing you to switch contexts with a single command.

## Why?

Git worktrees are a superior alternative to `git stash` for working on multiple branches simultaneously.
However, the manual setup can be cumbersome: you have to create the worktree, create a new tmux window or
session, and `cd` into the new directory. This tool handles all of that for you.

## Installation

```bash
# After cloning the repository, to install dependencies and link the binary:
npm install && npm link
```

## Basic Commands

### Create a new worktree

Creates a new git worktree, a new branch with the same name, and a detached tmux session that opens in
the new worktree's directory.

```bash
wt-mgr new <worktree-name> [base-branch]
```

**Example:**
```bash
# Creates a worktree and branch named 'hotfix-123' from 'main'
wt-mgr new hotfix-123 main
```
You can then attach to the new session with `tmux attach -t hotfix-123`.

### List managed worktrees

Lists all worktrees currently managed by `wt-mgr`, showing their name, path, and tmux session status.

```bash
wt-mgr list
```

### Delete a worktree

Removes the specified worktree and kills its associated tmux session.

```bash
wt-mgr delete <worktree-name>
```

**Example:**
```bash
wt-mgr delete hotfix-123
```
