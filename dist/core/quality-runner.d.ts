import type { AppQualityResult, PackageManager, QualityResult } from '../types/index.js';
type QualityKind = 'lint' | 'typecheck' | 'test';
interface QualityCommandPlan {
    command: string;
    cwd: string;
}
/**
 * Run the full quality check pipeline: lint -> typecheck -> test.
 * Commands are inferred from app/root package.json scripts first, then
 * fall back to local package-manager execution.
 */
export declare function runQualityChecks(appPath: string, projectRoot?: string, appName?: string): AppQualityResult;
export declare function aggregateQualityResults(results: AppQualityResult[]): QualityResult | undefined;
export declare function detectPackageManager(projectRoot: string, appPath?: string): PackageManager;
export declare function resolveQualityCommand(kind: QualityKind, packageManager: PackageManager, appPath: string, projectRoot: string): QualityCommandPlan;
export {};
//# sourceMappingURL=quality-runner.d.ts.map