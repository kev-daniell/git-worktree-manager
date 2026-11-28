import path from "path";
import { CommandModule } from "yargs";
import { logger } from "../logger";
import { readState, writeState } from "../state";
import { getProviderByName } from "../plugins";
import { Worktree } from "../types";
import { resolveOriginalRepo } from "../git";

export const command = 'list';
export const describe = 'List all managed git worktrees';
export const aliases = ['l'];

interface ListCommandArgs {
  long?: boolean;
}

export type WorktreePartition = Map<string, Worktree[]>;

export const builder: CommandModule<{}, ListCommandArgs>['builder'] = (yargs) => {
  return yargs
    .option('long', {
      alias: 'l',
      describe: 'List worktrees in detailed table format',
      type: 'boolean',
      default: false,
    })
}

export const handler: CommandModule<{}, ListCommandArgs>['handler'] = async (argv) => {
  const { long: verbose } = argv;

  try {
    logger.info('Listing worktrees...\n');

    // 1. Find the worktree in our state
    const worktrees = readState()

    // 2. List worktrees if any
    if (worktrees.length == 0) {
      logger.log("No worktrees are currently being managed.\n")
      logger.info("Try `wtmg new <my-feature>` to create one.")
      return;
    } else {
      logger.success(`Managed worktrees (${worktrees.length})`);
      const partition = await groupByWorktree(worktrees);

      if (verbose) printWorktreesVerbose(partition);
      else printWorktreesConcise(partition);
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occured.';
    logger.error(`❌ Failed to list worktrees: ${msg}.`);
  }
};

// `persist` used here so we can leverage dependency injection for testing
export async function groupByWorktree(
  wts: Worktree[],
  persist: (worktrees: Worktree[]) => void = writeState
): Promise<WorktreePartition> {
  const nameToWt: WorktreePartition = new Map();
  let updated = false;

  for (const wt of wts) {
    let originalRepoPath = wt.originalRepo;

    if (!originalRepoPath) {
      originalRepoPath = await resolveOriginalRepo(wt.path);

      if (originalRepoPath) {
        wt.originalRepo = originalRepoPath;
        updated = true;
      }
    }

    const key = originalRepoPath ?? '';
    const wtGroup = nameToWt.get(key) ?? [];
    wtGroup.push(wt);
    nameToWt.set(key, wtGroup);
  }

  if (updated) {
    persist(wts);
  }

  return nameToWt;
}

export function formatWorktreesConcise(partition: WorktreePartition, cwd = process.cwd()): string {
  const sections: string[] = [];

  for (const [originalRepoPath, wts] of partition) {
    const lines = wts.map((wt) =>
      wt.path === cwd ? `  * ${wt.name}` : `    ${wt.name}`
    );
    const repoName = originalRepoPath ? path.basename(originalRepoPath) : 'Unknown repo';

    const originalRepoLine = originalRepoPath === cwd ? `  * ${repoName}\n${lines.join('\n')}`
                                                      : `    ${repoName}\n${lines.join('\n')}`;
    sections.push(originalRepoLine);
  }

  return sections.join('\n\n');
}

function printWorktreesConcise(partition: WorktreePartition): void {
  logger.log(formatWorktreesConcise(partition));
}

function printWorktreesVerbose(partition: WorktreePartition): void {
  const formattedWorktrees: Array<{ name: string; path: string; workspace: string }> = [];

  for (const [originalRepoPath, worktrees] of partition) {
    const repoName = originalRepoPath ? path.basename(originalRepoPath) : 'Unknown repo';
    formattedWorktrees.push({
      name: repoName,
      path: originalRepoPath || 'N/A',
      workspace: 'N/A',
    });

    for (const wt of worktrees) {
      let workspace_details = 'N/A';
      if (wt.workspace) {
        const provider = getProviderByName(wt.workspace.provider);
        if (provider.getDisplayDetails) {
          workspace_details = provider.getDisplayDetails(wt.workspace.metadata);
        } else {
          workspace_details = JSON.stringify(wt.workspace.metadata);
        }
      }

      formattedWorktrees.push({
        name: wt.name,
        path: wt.path,
        workspace: workspace_details,
      });
    }
  }

  console.table(formattedWorktrees);
}
