import type { RuleSource, RuleSet } from '../types/index.js';
/**
 * Find all rule source files under the app directory.
 * Scope is strictly limited to documented patterns.
 */
export declare function findRuleSources(appPath: string): RuleSource[];
/**
 * Detect which style system is in use based on rule source content.
 * Returns null if none detected, or "conflict: <list>" if multiple detected.
 */
export declare function detectStyleSystem(sources: RuleSource[]): string | null;
/**
 * Extract rule directives from sources.
 * Matches lines like "- must: use Tailwind" or "* should: follow ESLint config".
 */
export declare function extractDirectives(sources: RuleSource[]): string[];
/**
 * Load the complete rule set for a given app.
 */
export declare function loadRuleSet(appPath: string, appName: string): RuleSet;
//# sourceMappingURL=rules-loader.d.ts.map