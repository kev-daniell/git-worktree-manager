# git-worktree-manager

[![Build Status]](https://github.com/kev-daniell/dotfiles/actions/workflows/ci.yaml)

[build status]: https://github.com/kev-daniell/dotfiles/actions/workflows/ci.yaml/badge.svg?event=push

A simple CLI tool to manage Git worktrees and tmux sessions.

## Why?

As a developer, Git worktrees became a growing part of my daily workflow. As I used it more, it
became repetitive to manually create a new tmux pane, navigate the new worktree directory, and close all
tasks related to that worktree when I was done with the feature.

So, I created `wtmg` to manage worktrees and the tmux windows I use to interact with other working trees. 

`wtmg` has a plugin architecture that can work with virtually any workspace. Contributions for other
workspace managers, multiplexers or IDEs are welcome!

## Installation

### Method 1: Via npm or Bun (Easiest)

You can install the package globally using npm or bun:

```bash
# Using npm
npm install -g git-worktree-manager

# Using bun
bun add -g git-worktree-manager
```

---

### Method 2: Standalone Binary

You can download a pre-compiled, self-contained binary for your platform from the [Releases](https://github.com/kev-daniell/git-worktree-manager/releases) page. You do not need to install Bun or Node.js to use this.

1. Download the correct binary for your system:
   - **Linux x64:** `wtmg-linux-x64`
   - **macOS Intel:** `wtmg-darwin-x64`
   - **macOS Apple Silicon:** `wtmg-darwin-arm64`

2. Make the binary executable:
   ```bash
   chmod +x wtmg-darwin-arm64  # Replace with your downloaded binary name
   ```

3. Move the binary into your `$PATH` (e.g., `/usr/local/bin`) and rename it to `wtmg`:
   ```bash
   mv wtmg-darwin-arm64 /usr/local/bin/wtmg
   ```

> [!IMPORTANT]
> **macOS "Damaged/Cannot be opened" Gatekeeper Workaround:**
> Since these binaries are not codesigned with an Apple Developer ID, macOS Gatekeeper may flag the downloaded binary as "damaged". If you get this error, you can strip the quarantine attribute by running:
> ```bash
> xattr -d com.apple.quarantine /usr/local/bin/wtmg
> ```

---

### Method 3: From Source (Using Bun)

If you prefer to run or modify the source code directly:

1. Install [Bun](https://bun.sh/) if you haven't already:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Clone this repository and install dependencies:
   ```bash
   git clone https://github.com/kev-daniell/git-worktree-manager.git
   cd git-worktree-manager
   bun install
   ```

3. Make the runner executable and symlink it to a directory in your `$PATH` (e.g., `/usr/local/bin`):
   ```bash
   chmod +x bin/run.ts
   ln -sf $(pwd)/bin/run.ts /usr/local/bin/wtmg
   ```

## Usage

Once installed, you can use the `wtmg` command to manage your worktrees.

## Basic Commands

| Command | Alias(es) | Description |
| --- | --- | --- |
| `new <name> [base-branch]` | `n` | Creates a new worktree and branch. Use `--workspace` or `-w` to also create a workspace session/window. |
| `list` | `l` | Lists all managed worktrees. |
| `delete <name>` | `d`, `rm` | Removes a managed worktree. Use `--workspace` to close the workspace window and `--branch` to delete the git branch. |
| `set-workspace <provider>` | `sw` | Sets the default workspace provider (e.g. `tmux`, `none`). |

## Workspace Integrations

Inside `wtmg`, a **workspace** refers to the development environment associated with your worktree.
The tool supports the following workspace integrations:

- **`tmux`**: Integrates with the Tmux terminal multiplexer. If run inside a Tmux session,
it spawns a new window; if run outside, it starts a detached session.
- **`vscode`** : Opens the newly created worktree directory in a fresh VS Code window using the `code` CLI.
- **`none`**: Only manages the Git worktree, without launching any terminal multiplexer or IDE window.

You can set your preferred workspace provider globally using `wtmg set-workspace <provider>`.

### Examples

**Create a new worktree based on the current branch (without tmux):**
```bash
wtmg new my-feature
```

**Create a new worktree and open it in a new tmux window/session:**
```bash
wtmg new my-feature --workspace
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
wtmg delete my-feature --workspace --branch
```

## Local Development

Since this project runs natively using the Bun runtime, you do not need a compilation step. You can run and test your TypeScript source code directly.

- **Running tests:**
  ```bash
  bun test
  ```
- **Executing directly:**
  ```bash
  bun bin/run.ts list
  ```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the ISC License.
