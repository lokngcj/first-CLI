/** Get the list of staged (tracked, in-index) file paths relative to the project root */
export declare function getStagedFiles(projectRoot: string): Promise<string[]>;
/** Get the list of tracked files in the repository */
export declare function getTrackedFiles(projectRoot: string): Promise<string[]>;
/** Check if a directory is within a git repository */
export declare function isGitRepo(projectRoot: string): Promise<boolean>;
/** Reset the git instance cache (useful for testing) */
export declare function resetGitCache(): void;
//# sourceMappingURL=git.d.ts.map