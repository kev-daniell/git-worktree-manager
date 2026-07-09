# wt-mgr

A simple CLI tool to manage Git worktrees and tmux sessions.

## Why?

While `git stash` is a useful command, it can become cumbersome when you need to switch between
branches frequently. Git worktrees offer a more robust solution by allowing you to check out multiple
branches at once, each in its own directory. This tool takes it a step further by automating the setup
of worktrees and integrating them with tmux, so you can switch contexts with a single command.

## Installation

```bash
# After cloning the repository, to install dependencies and link the binary:
npm run build
```

## Usage

Once installed, you can use the `wt-mgr` command to manage your worktrees.

### Examples

**Create a new worktree based on the current branch:**
```bash
wt-mgr new my-feature
```

**Create a new worktree based on a specific branch:**
```bash
wt-mgr new hotfix-123 main
```

**List all managed worktrees:**
```bash
wt-mgr list
```

**Delete a worktree and its associated tmux window and git branch:**
```bash
wt-mgr delete my-feature --tmux --branch
```

## Basic Commands

| Command | Alias(es) | Description |
| --- | --- | --- |
| `new <name> [base-branch]` | `n` | Creates a new worktree, branch, and tmux session. |
| `list` | `l` | Lists all managed worktrees. |
| `delete <name>` | `d`, `rm` | Removes a managed worktree. Use `--tmux` to close the tmux window and `--branch` to delete the git branch. |


## TODO

- [ ] **Configuration**: Allow users to configure the base path for new worktrees.
- [ ] **State Sync**: Add a command to sync the state file with the actual git worktrees on the system.
- [ ] **Error Handling**: Improve error handling and provide more specific feedback.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the ISC License.
