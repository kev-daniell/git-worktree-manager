# git-worktree-manager

[![Build Status]](https://github.com/kev-daniell/dotfiles/actions/workflows/ci.yaml)

[build status]: https://github.com/kev-daniell/dotfiles/actions/workflows/ci.yaml/badge.svg?event=push

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

Once installed, you can use the `wtmg` command to manage your worktrees.

## Basic Commands

| Command | Alias(es) | Description |
| --- | --- | --- |
| `new <name> [base-branch]` | `n` | Creates a new worktree and branch. Use `--tmux` or `-t` to also create a tmux session/window. |
| `list` | `l` | Lists all managed worktrees. |
| `delete <name>` | `d`, `rm` | Removes a managed worktree. Use `--tmux` to close the tmux window and `--branch` to delete the git branch. |

### Examples

**Create a new worktree based on the current branch (without tmux):**
```bash
wtmg new my-feature
```

**Create a new worktree and open it in a new tmux window/session:**
```bash
wtmg new my-feature --tmux
```

**Create a new worktree based on a specific branch:**
```bash
wtmg new hotfix-123 main
```

**List all managed worktrees:**
```bash
wtmg list
```

**Delete a worktree and its associated tmux window and git branch:**
```bash
wtmg delete my-feature --tmux --branch
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the ISC License.
