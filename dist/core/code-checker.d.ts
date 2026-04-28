import type { RulesViolation, RuleSet } from '../types/index.js';
/**
 * Check a single file for all code rule violations.
 * Test files are exempt from the unified request wrapper checks.
 */
export declare function checkFileViolations(absolutePath: string, ruleSet: RuleSet): RulesViolation[];
//# sourceMappingURL=code-checker.d.ts.map