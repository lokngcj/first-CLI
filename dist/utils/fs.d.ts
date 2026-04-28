/** Check if a path exists on disk */
export declare function fileExists(filePath: string): boolean;
/** Check if a path is a directory */
export declare function isDirectory(filePath: string): boolean;
/** Check if a path is a file */
export declare function isFile(filePath: string): boolean;
/** Read a file as UTF-8 text */
export declare function readFile(filePath: string): string;
/** Get file size in bytes */
export declare function getFileSize(filePath: string): number;
/** Get file extension (lowercased, without dot) */
export declare function getFileExtension(filePath: string): string;
/** Resolve a path relative to current working directory, making it absolute */
export declare function resolvePath(input: string): string;
/** Get relative path from base to target */
export declare function getRelativePath(target: string, base: string): string;
/** Ensure a directory exists, creating it recursively if needed */
export declare function ensureDir(dirPath: string): void;
/** Write file, creating parent directories if needed */
export declare function writeFile(filePath: string, content: string): void;
/** Recursively walk a directory, yielding all file paths */
export declare function walkDir(dirPath: string, predicate?: (filePath: string) => boolean): string[];
/**
 * Find files matching a simple glob-like pattern relative to a base directory.
 * Supports ** for recursive matching and * for single-segment wildcards.
 */
export declare function findFiles(pattern: string, baseDir: string): string[];
/** Check if a file path matches any of the given regex patterns */
export declare function matchesAnyPattern(filePath: string, patterns: RegExp[]): boolean;
/** Format bytes to human-readable string */
export declare function formatBytes(bytes: number): string;
//# sourceMappingURL=fs.d.ts.map