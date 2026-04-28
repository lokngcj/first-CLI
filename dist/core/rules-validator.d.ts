import type { RulesException, RuleSet } from '../types/index.js';
/**
 * Validate a rule set for internal conflicts and issues.
 * Rule source exceptions always take priority over code violations.
 */
export declare function validateRuleSources(ruleSet: RuleSet): RulesException[];
/** Check if any exception is an error (blocks further checks) */
export declare function hasErrors(exceptions: RulesException[]): boolean;
//# sourceMappingURL=rules-validator.d.ts.map