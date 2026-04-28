import { join } from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { createTestMonorepo, type TestMonorepo } from '../helpers/fixtures.js';
import { checkFileViolations } from '../../src/core/code-checker.js';
import { loadRuleSet } from '../../src/core/rules-loader.js';

let repo: TestMonorepo | undefined;

afterEach(() => {
  repo?.cleanup();
  repo = undefined;
});

describe('code-checker', () => {
  it('detects required code violation categories in business files', () => {
    repo = createTestMonorepo();
    const appPath = join(repo.root, 'apps', 'web');
    const ruleSet = loadRuleSet(appPath, 'web');

    const violations = checkFileViolations(join(appPath, 'src', 'Demo.tsx'), ruleSet);

    expect(violations.map((v) => v.type)).toEqual([
      'direct_axios',
      'nonstandard_api_call',
      'useCallback_abuse',
      'i18n_hardcoding',
      'direct_axios',
      'direct_fetch',
      'nonstandard_api_call',
      'i18n_hardcoding',
    ]);
    expect(violations.filter((v) => v.severity === 'error')).toHaveLength(7);
    expect(violations.filter((v) => v.severity === 'warning')).toHaveLength(1);
  });

  it('does not report axios, fetch, or i18n violations inside comments', () => {
    repo = createTestMonorepo();
    const appPath = join(repo.root, 'apps', 'web');
    const ruleSet = loadRuleSet(appPath, 'web');

    const violations = checkFileViolations(join(appPath, 'src', 'CommentOnly.ts'), ruleSet);

    expect(violations).toEqual([]);
  });

  it('exempts test files from unified request wrapper checks', () => {
    repo = createTestMonorepo();
    const appPath = join(repo.root, 'apps', 'web');
    const ruleSet = loadRuleSet(appPath, 'web');

    const violations = checkFileViolations(join(appPath, 'src', 'Demo.test.ts'), ruleSet);

    expect(violations).toEqual([]);
  });
});
