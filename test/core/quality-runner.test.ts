import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createTestMonorepo, type TestMonorepo } from '../helpers/fixtures.js';
import {
  aggregateQualityResults,
  detectPackageManager,
  resolveQualityCommand,
  runQualityChecks,
} from '../../src/core/quality-runner.js';

let repo: TestMonorepo | undefined;

afterEach(() => {
  repo?.cleanup();
  repo = undefined;
});

describe('quality-runner', () => {
  it('detects package manager from root lockfiles', () => {
    repo = createTestMonorepo();
    writeFileSync(join(repo.root, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n', 'utf8');

    expect(detectPackageManager(repo.root, join(repo.root, 'apps', 'web'))).toBe('pnpm');
  });

  it('prefers app package scripts over fallback commands', () => {
    repo = createTestMonorepo();
    const appPath = join(repo.root, 'apps', 'web');
    writeFileSync(
      join(appPath, 'package.json'),
      JSON.stringify({
        scripts: {
          lint: 'node -e "console.log(\'app lint\')"',
          typecheck: 'node -e "console.log(\'app typecheck\')"',
          test: 'node -e "console.log(\'app test\')"',
        },
      }),
      'utf8',
    );

    expect(resolveQualityCommand('lint', 'npm', appPath, repo.root)).toEqual({
      command: 'npm run lint',
      cwd: appPath,
    });
  });

  it('falls back to root package scripts when app scripts are absent', () => {
    repo = createTestMonorepo();
    const appPath = join(repo.root, 'apps', 'web');
    writeFileSync(
      join(repo.root, 'package.json'),
      JSON.stringify({
        scripts: {
          lint: 'node -e "console.log(\'root lint\')"',
        },
      }),
      'utf8',
    );

    expect(resolveQualityCommand('lint', 'npm', appPath, repo.root)).toEqual({
      command: 'npm run lint',
      cwd: repo.root,
    });
  });

  it('runs inferred app quality scripts and aggregates multi-app results', () => {
    repo = createTestMonorepo();
    const webPath = join(repo.root, 'apps', 'web');
    const adminPath = join(repo.root, 'apps', 'admin');
    writeQualityPackage(webPath, 'web');
    writeQualityPackage(adminPath, 'admin');

    const results = [
      runQualityChecks(webPath, repo.root, 'web'),
      runQualityChecks(adminPath, repo.root, 'admin'),
    ];
    const aggregate = aggregateQualityResults(results);

    expect(results[0].lint.command).toBe('npm run lint');
    expect(results[0].lint.output).toContain('web lint');
    expect(aggregate?.packageManager).toBe('npm');
    expect(aggregate?.apps).toHaveLength(2);
    expect(aggregate?.lint.success).toBe(true);
    expect(aggregate?.lint.output).toContain('[web]');
    expect(aggregate?.lint.output).toContain('[admin]');
  });
});

function writeQualityPackage(appPath: string, label: string): void {
  mkdirSync(appPath, { recursive: true });
  writeFileSync(
    join(appPath, 'package.json'),
    JSON.stringify({
      scripts: {
        lint: `node -e "console.log('${label} lint')"`,
        typecheck: `node -e "console.log('${label} typecheck')"`,
        test: `node -e "console.log('${label} test')"`,
      },
    }),
    'utf8',
  );
}
