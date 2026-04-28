import type { QualityResult } from '../types/index.js';
/**
 * Run the full quality check pipeline: lint → typecheck → test.
 * Each step uses the target project's locally installed dependencies.
 */
export declare function runQualityChecks(appPath: string): QualityResult;
//# sourceMappingURL=quality-runner.d.ts.map