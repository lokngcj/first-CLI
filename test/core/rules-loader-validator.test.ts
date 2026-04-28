import { describe, expect, it, afterEach } from 'vitest';
import { createTestMonorepo, type TestMonorepo } from '../helpers/fixtures.js';
import { loadRuleSet } from '../../src/core/rules-loader.js';
import { hasErrors, validateRuleSources } from '../../src/core/rules-validator.js';
import { join } from 'node:path';

let repo: TestMonorepo | undefined;

afterEach(() => {
  repo?.cleanup();
  repo = undefined;
});

describe('rules loader and validator', () => {
  it('loads only documented rule sources and extracts directives', () => {
    repo = createTestMonorepo();

    const ruleSet = loadRuleSet(join(repo.root, 'apps', 'web'), 'web');

    expect(ruleSet.sources.map((s) => s.path).sort()).toEqual([
      'PROJECT_GUIDE.md',
      'README.md',
      'skills/api.md',
    ]);
    expect(ruleSet.styleSystem).toBe('tailwind');
    expect(ruleSet.directives).toEqual(
      expect.arrayContaining([
        '[PROJECT_GUIDE.md] must: use Tailwind for styling',
        '[PROJECT_GUIDE.md] never: call axios or fetch directly',
        '[skills/api.md] always: use the shared request wrapper for HTTP calls',
      ]),
    );
  });

  it('reports conflict markers, guide placeholders, and style conflicts first', () => {
    repo = createTestMonorepo();

    const ruleSet = loadRuleSet(join(repo.root, 'apps', 'admin'), 'admin');
    const exceptions = validateRuleSources(ruleSet);

    expect(exceptions.map((e) => e.type)).toEqual([
      'conflict_marker',
      'guide_mismatch',
      'style_conflict',
    ]);
    expect(hasErrors(exceptions)).toBe(true);
  });
});
