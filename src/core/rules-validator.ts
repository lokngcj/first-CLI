// ============================================================
// Rules validator — checks rule sources for conflicts, mismatches,
// and structural issues before code verification runs
// ============================================================

import { CONFLICT_MARKERS } from '../utils/constants.js';
import type { RulesException, RuleSet } from '../types/index.js';

/**
 * Validate a rule set for internal conflicts and issues.
 * Rule source exceptions always take priority over code violations.
 */
export function validateRuleSources(ruleSet: RuleSet): RulesException[] {
  const exceptions: RulesException[] = [];

  for (const source of ruleSet.sources) {
    // Check for git merge conflict markers left in files
    for (const marker of CONFLICT_MARKERS) {
      if (marker.test(source.content)) {
        exceptions.push({
          type: 'conflict_marker',
          source: source.path,
          message: `Unresolved conflict marker found in "${source.path}". Resolve all merge conflicts before proceeding with code verification.`,
          severity: 'error',
        });
        break;
      }
    }
  }

  // Check PROJECT_GUIDE.md for unresolved placeholders
  const guide = ruleSet.sources.find((s) => s.type === 'project_guide');
  if (guide) {
    const placeholderRe = /\b(TODO|FIXME|XXX|PLACEHOLDER)\b/gi;
    let match: RegExpExecArray | null;
    while ((match = placeholderRe.exec(guide.content)) !== null) {
      exceptions.push({
        type: 'guide_mismatch',
        source: guide.path,
        message: `PROJECT_GUIDE.md contains unresolved placeholder "${match[1]}". Fill in or remove placeholder content.`,
        severity: 'warning',
      });
    }
  }

  // Check for style system conflicts (multiple style systems detected)
  if (ruleSet.styleSystem && ruleSet.styleSystem.startsWith('conflict:')) {
    const systems = ruleSet.styleSystem.replace('conflict: ', '');
    exceptions.push({
      type: 'style_conflict',
      source: 'multiple',
      message: `Conflicting style systems detected across rule sources: ${systems}. Standardize on a single style system and update all rule references.`,
      severity: 'error',
    });
  }

  // Warn if PROJECT_GUIDE.md is missing (recommended but not required)
  if (!ruleSet.sources.some((s) => s.type === 'project_guide')) {
    exceptions.push({
      type: 'rule_missing',
      source: 'PROJECT_GUIDE.md',
      message: 'PROJECT_GUIDE.md not found. This file is recommended to define project-specific conventions, API patterns, and style rules.',
      severity: 'warning',
    });
  }

  return exceptions;
}

/** Check if any exception is an error (blocks further checks) */
export function hasErrors(exceptions: RulesException[]): boolean {
  return exceptions.some((e) => e.severity === 'error');
}
