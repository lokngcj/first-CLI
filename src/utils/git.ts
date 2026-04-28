// ============================================================
// Git integration via simple-git
// ============================================================

import { simpleGit, SimpleGit } from 'simple-git';

let _gitInstances = new Map<string, SimpleGit>();

function getGit(projectRoot: string): SimpleGit {
  let git = _gitInstances.get(projectRoot);
  if (!git) {
    git = simpleGit(projectRoot);
    _gitInstances.set(projectRoot, git);
  }
  return git;
}

/** Get the list of staged (tracked, in-index) file paths relative to the project root */
export async function getStagedFiles(projectRoot: string): Promise<string[]> {
  const git = getGit(projectRoot);
  const status = await git.status();
  // staged = files in the index (new + modified + deleted, staged)
  return status.staged;
}

/** Get the list of tracked files in the repository */
export async function getTrackedFiles(projectRoot: string): Promise<string[]> {
  const git = getGit(projectRoot);
  // Get all tracked files (not deleted) from git
  const result = await git.raw(['ls-files']);
  return result.split('\n').filter(Boolean);
}

/** Check if a directory is within a git repository */
export async function isGitRepo(projectRoot: string): Promise<boolean> {
  try {
    const git = getGit(projectRoot);
    await git.status();
    return true;
  } catch {
    return false;
  }
}

/** Reset the git instance cache (useful for testing) */
export function resetGitCache(): void {
  _gitInstances.clear();
}
