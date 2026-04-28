// ============================================================
// File system utilities
// ============================================================
import { existsSync, statSync, readFileSync, readdirSync, writeFileSync, mkdirSync, } from 'node:fs';
import { resolve, relative, dirname, extname, join } from 'node:path';
/** Check if a path exists on disk */
export function fileExists(filePath) {
    return existsSync(filePath);
}
/** Check if a path is a directory */
export function isDirectory(filePath) {
    try {
        return statSync(filePath).isDirectory();
    }
    catch {
        return false;
    }
}
/** Check if a path is a file */
export function isFile(filePath) {
    try {
        return statSync(filePath).isFile();
    }
    catch {
        return false;
    }
}
/** Read a file as UTF-8 text */
export function readFile(filePath) {
    return readFileSync(filePath, 'utf-8');
}
/** Get file size in bytes */
export function getFileSize(filePath) {
    return statSync(filePath).size;
}
/** Get file extension (lowercased, without dot) */
export function getFileExtension(filePath) {
    return extname(filePath).toLowerCase().slice(1);
}
/** Resolve a path relative to current working directory, making it absolute */
export function resolvePath(input) {
    return resolve(input);
}
/** Get relative path from base to target */
export function getRelativePath(target, base) {
    return relative(base, target);
}
/** Ensure a directory exists, creating it recursively if needed */
export function ensureDir(dirPath) {
    mkdirSync(dirPath, { recursive: true });
}
/** Write file, creating parent directories if needed */
export function writeFile(filePath, content) {
    ensureDir(dirname(filePath));
    writeFileSync(filePath, content, 'utf-8');
}
/** Recursively walk a directory, yielding all file paths */
export function walkDir(dirPath, predicate) {
    const results = [];
    if (!isDirectory(dirPath))
        return results;
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkDir(fullPath, predicate));
        }
        else if (!predicate || predicate(fullPath)) {
            results.push(fullPath);
        }
    }
    return results;
}
/**
 * Find files matching a simple glob-like pattern relative to a base directory.
 * Supports ** for recursive matching and * for single-segment wildcards.
 */
export function findFiles(pattern, baseDir) {
    const results = [];
    // If pattern contains **, do a recursive walk
    if (pattern.includes('**')) {
        const parts = pattern.split('**').map((p) => p.replace(/^[/\\]/, '').replace(/[/\\]$/, ''));
        const prefix = parts[0] ? join(baseDir, parts[0]) : baseDir;
        const suffix = parts[1] || '';
        if (!isDirectory(prefix))
            return results;
        const allFiles = walkDir(prefix);
        for (const file of allFiles) {
            const rel = relative(baseDir, file).replace(/\\/g, '/');
            if (matchSimpleGlob(rel, pattern.replace(/\\/g, '/'))) {
                results.push(file);
            }
        }
        return results;
    }
    // Simple prefix match
    const fullPath = join(baseDir, pattern);
    if (isFile(fullPath)) {
        results.push(fullPath);
    }
    return results;
}
/** Check if a file path matches a simple glob pattern */
function matchSimpleGlob(filePath, pattern) {
    const regex = new RegExp('^' +
        pattern
            .replace(/\./g, '\\.')
            .replace(/\*\*/g, '<<<GLOBSTAR>>>')
            .replace(/\*/g, '[^/]*')
            .replace(/<<<GLOBSTAR>>>/g, '.*') +
        '$');
    return regex.test(filePath);
}
/** Check if a file path matches any of the given regex patterns */
export function matchesAnyPattern(filePath, patterns) {
    return patterns.some((p) => p.test(filePath));
}
/** Format bytes to human-readable string */
export function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
//# sourceMappingURL=fs.js.map