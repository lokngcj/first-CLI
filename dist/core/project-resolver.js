// ============================================================
// Project & app resolver — validates monorepo structure and
// resolves which app a target file belongs to
// ============================================================
import { join, isAbsolute } from 'node:path';
import { readdirSync } from 'node:fs';
import { fileExists, isDirectory, getRelativePath } from '../utils/fs.js';
import { APPS_DIR } from '../utils/constants.js';
/**
 * Validate that the given path is a valid Monorepo project root.
 * Returns the resolved absolute path.
 */
export function validateProject(projectPath) {
    if (!isAbsolute(projectPath)) {
        throw new Error(`Project path must be absolute: ${projectPath}\n` +
            `Provide the absolute path to a Monorepo project root with an "apps/" directory.`);
    }
    if (!fileExists(projectPath)) {
        throw new Error(`Project path does not exist: ${projectPath}\n` +
            `Provide a valid absolute path to a Monorepo project with an "apps/" directory.`);
    }
    if (!isDirectory(projectPath)) {
        throw new Error(`Project path is not a directory: ${projectPath}\n` +
            `Provide the root directory of the Monorepo project.`);
    }
    const appsDir = join(projectPath, APPS_DIR);
    if (!isDirectory(appsDir)) {
        throw new Error(`Not a valid Monorepo project: no "${APPS_DIR}/" directory found under ${projectPath}\n` +
            `This tool requires an "apps/*" Monorepo structure. Ensure the --project path points to the project root.`);
    }
    return projectPath;
}
/**
 * Determine which app a target file belongs to.
 * The target file path can be absolute or relative to the project root.
 */
export function resolveApp(projectRoot, targetFile) {
    // Normalize to a relative path from the project root
    let relativePath;
    if (isAbsolute(targetFile)) {
        relativePath = getRelativePath(targetFile, projectRoot);
    }
    else {
        relativePath = targetFile;
    }
    // Normalize path separators
    const normalized = relativePath.replace(/\\/g, '/');
    if (!normalized.startsWith(`${APPS_DIR}/`)) {
        throw new Error(`Target file is not within an app under ${APPS_DIR}/: ${normalized}\n` +
            `All source files must reside under ${APPS_DIR}/<app-name>/ to be recognized.`);
    }
    const parts = normalized.split('/');
    const appName = parts[1];
    const appPath = join(projectRoot, APPS_DIR, appName);
    if (!isDirectory(appPath)) {
        throw new Error(`App directory does not exist: ${appPath}\n` +
            `The path resolves to app "${appName}" but no such directory exists under ${APPS_DIR}/.`);
    }
    const targetFileAbsolute = isAbsolute(targetFile)
        ? targetFile
        : join(projectRoot, normalized);
    if (!fileExists(targetFileAbsolute)) {
        throw new Error(`Target file does not exist: ${targetFileAbsolute}\n` +
            `Verify the --target path points to an existing file within the project.`);
    }
    return {
        projectRoot,
        appName,
        appPath,
        targetFile: normalized,
        targetFileAbsolute,
    };
}
/**
 * Resolve app context from a target file that may not exist yet
 * (for preflight on files that are about to be created).
 */
export function resolveAppLax(projectRoot, targetFile) {
    let relativePath;
    if (isAbsolute(targetFile)) {
        relativePath = getRelativePath(targetFile, projectRoot);
    }
    else {
        relativePath = targetFile;
    }
    const normalized = relativePath.replace(/\\/g, '/');
    if (!normalized.startsWith(`${APPS_DIR}/`)) {
        throw new Error(`Target file is not within an app under ${APPS_DIR}/: ${normalized}`);
    }
    const parts = normalized.split('/');
    const appName = parts[1];
    const appPath = join(projectRoot, APPS_DIR, appName);
    if (!isDirectory(appPath)) {
        throw new Error(`App directory does not exist: ${appPath}`);
    }
    // Don't check if target file exists — it may be a new file
    return {
        projectRoot,
        appName,
        appPath,
        targetFile: normalized,
        targetFileAbsolute: join(projectRoot, normalized),
    };
}
/** List all app names under apps/ */
export function listApps(projectRoot) {
    const appsDir = join(projectRoot, APPS_DIR);
    const entries = readdirSync(appsDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}
//# sourceMappingURL=project-resolver.js.map