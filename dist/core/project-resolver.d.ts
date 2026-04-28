import type { AppContext } from '../types/index.js';
/**
 * Validate that the given path is a valid Monorepo project root.
 * Returns the resolved absolute path.
 */
export declare function validateProject(projectPath: string): string;
/**
 * Determine which app a target file belongs to.
 * The target file path can be absolute or relative to the project root.
 */
export declare function resolveApp(projectRoot: string, targetFile: string): AppContext;
/**
 * Resolve app context from a target file that may not exist yet
 * (for preflight on files that are about to be created).
 */
export declare function resolveAppLax(projectRoot: string, targetFile: string): AppContext;
/** List all app names under apps/ */
export declare function listApps(projectRoot: string): string[];
//# sourceMappingURL=project-resolver.d.ts.map