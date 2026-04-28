import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createTestMonorepo,
  initGitWithStagedFiles,
  type TestMonorepo,
} from '../helpers/fixtures.js';

interface CliResult {
  status: number;
  stdout: string;
  stderr: string;
}

let repo: TestMonorepo | undefined;

afterEach(() => {
  repo?.cleanup();
  repo = undefined;
});

describe('CLI commands', () => {
  it('preflight emits parseable json context for a new target file', () => {
    repo = createTestMonorepo();

    const result = runCli([
      'preflight',
      '--project',
      repo.root,
      '--target',
      'apps/web/src/NewFile.tsx',
      '--format',
      'json',
    ]);

    expect(result.status).toBe(0);
    expect(expectJson(result.stdout)).toMatchObject({
      command: 'preflight',
      app: 'web',
      styleSystem: 'tailwind',
    });
  });

  it('verify reports code violations in json format', () => {
    repo = createTestMonorepo();

    const result = runCli([
      'verify',
      '--project',
      repo.root,
      '--target',
      'apps/web/src/Demo.tsx',
      '--format',
      'json',
    ]);

    const json = expectJson(result.stdout);
    expect(result.status).toBe(1);
    expect(json.summary.violations).toBe(8);
    expect(json.violations.map((v: { type: string }) => v.type)).toContain('nonstandard_api_call');
  });

  it('verify staged files through git integration', () => {
    repo = createTestMonorepo();
    initGitWithStagedFiles(repo.root, [
      'apps/web/PROJECT_GUIDE.md',
      'apps/web/README.md',
      'apps/web/src/Demo.tsx',
    ]);

    const result = runCli([
      'verify',
      '--project',
      repo.root,
      '--staged',
      '--format',
      'json',
    ]);

    const json = expectJson(result.stdout);
    expect(result.status).toBe(1);
    expect(json.target).toBe('<staged files>');
    expect(json.schemaVersion).toBe('1.0');
    expect(json.app).toBe('web');
    expect(json.summary.violations).toBe(8);
  });

  it('runs staged quality checks for each touched app', () => {
    repo = createTestMonorepo();
    const shopPath = join(repo.root, 'apps', 'shop');
    mkdirSync(join(shopPath, 'src'), { recursive: true });
    writeFileSync(
      join(shopPath, 'PROJECT_GUIDE.md'),
      '# Shop Guide\n- must: use Tailwind for styling\n',
      'utf8',
    );
    writeFileSync(join(shopPath, 'README.md'), 'tailwindcss\n', 'utf8');
    writeFileSync(join(shopPath, 'src', 'index.ts'), 'export const ok = 1;\n', 'utf8');
    writeQualityPackage(join(repo.root, 'apps', 'web'), 'web');
    writeQualityPackage(shopPath, 'shop');
    initGitWithStagedFiles(repo.root, [
      'apps/web/PROJECT_GUIDE.md',
      'apps/web/README.md',
      'apps/web/src/Demo.tsx',
      'apps/shop/PROJECT_GUIDE.md',
      'apps/shop/README.md',
      'apps/shop/src/index.ts',
    ]);

    const result = runCli([
      'verify',
      '--project',
      repo.root,
      '--staged',
      '--quality',
      '--format',
      'json',
    ]);

    const json = expectJson(result.stdout);
    expect(result.status).toBe(1);
    expect(json.app.split(', ').sort()).toEqual(['shop', 'web']);
    expect(json.quality.apps).toHaveLength(2);
    expect(json.quality.apps.map((app: { appName: string }) => app.appName).sort()).toEqual([
      'shop',
      'web',
    ]);
    expect(json.quality.lint.command).toBe('<multiple apps>');
    expect(json.summary.lintPassed).toBe(true);
    expect(result.stderr).toContain('Running quality checks for web');
    expect(result.stderr).toContain('Running quality checks for shop');
  });

  it('fix-suggestions keeps json stdout parseable when rule sources are invalid', () => {
    repo = createTestMonorepo();

    const result = runCli([
      'fix-suggestions',
      '--project',
      repo.root,
      '--target',
      'apps/admin/src/index.ts',
      '--format',
      'json',
    ]);

    const json = expectJson(result.stdout);
    expect(result.status).toBe(1);
    expect(json.command).toBe('fix-suggestions');
    expect(json.exceptions).toHaveLength(3);
    expect(result.stderr).toContain('Fix rule source errors before generating code suggestions.');
  });

  it('rules-check reports rule source health by app', () => {
    repo = createTestMonorepo();

    const result = runCli(['rules-check', '--project', repo.root, '--format', 'json']);

    const json = expectJson(result.stdout);
    expect(result.status).toBe(1);
    expect(json.appCount).toBe(2);
    expect(json.summary.totalExceptions).toBe(3);
  });

  it('figma-compress validates project and skips images at or below 1 MB', () => {
    repo = createTestMonorepo();

    const invalidProject = runCli([
      'figma-compress',
      '--project',
      join(repo.root, 'missing'),
      '--input',
      join(repo.root, 'small.png'),
      '--output',
      join(repo.root, 'out.png'),
    ]);
    expect(invalidProject.status).toBe(1);
    expect(invalidProject.stderr).toContain('Project path does not exist');

    const validSmallImage = runCli([
      'figma-compress',
      '--project',
      repo.root,
      '--input',
      'small.png',
      '--output',
      'compressed/small.png',
    ]);
    expect(validSmallImage.status).toBe(0);
    expect(validSmallImage.stdout).toContain('Skipped');
    expect(existsSync(join(repo.root, 'compressed', 'small.png'))).toBe(false);
  });
});

function runCli(args: string[]): CliResult {
  const cliPath = resolve(process.cwd(), 'src', 'index.ts');
  const result = spawnSync(process.execPath, ['--import', 'tsx', cliPath, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function expectJson(stdout: string): any {
  expect(stdout).not.toBe('');
  return JSON.parse(stdout);
}

function writeQualityPackage(appPath: string, label: string): void {
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
