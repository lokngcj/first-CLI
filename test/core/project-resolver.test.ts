import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { createTestMonorepo, type TestMonorepo } from '../helpers/fixtures.js';
import {
  listApps,
  resolveApp,
  resolveAppLax,
  validateProject,
} from '../../src/core/project-resolver.js';

let repo: TestMonorepo | undefined;

afterEach(() => {
  repo?.cleanup();
  repo = undefined;
});

describe('project-resolver', () => {
  it('validates an absolute monorepo root with apps directory', () => {
    repo = createTestMonorepo();

    expect(validateProject(repo.root)).toBe(repo.root);
    expect(listApps(repo.root).sort()).toEqual(['admin', 'web']);
  });

  it('rejects a non-absolute project path', () => {
    expect(() => validateProject('relative/path')).toThrow(/must be absolute/i);
  });

  it('rejects a directory without apps', () => {
    repo = createTestMonorepo();
    const invalidRoot = join(repo.root, 'not-a-monorepo');
    mkdirSync(invalidRoot);

    expect(() => validateProject(invalidRoot)).toThrow(/no "apps\/" directory/i);
  });

  it('resolves existing target files to their app context', () => {
    repo = createTestMonorepo();

    const ctx = resolveApp(repo.root, 'apps/web/src/Demo.tsx');

    expect(ctx.appName).toBe('web');
    expect(ctx.targetFile).toBe('apps/web/src/Demo.tsx');
    expect(ctx.targetFileAbsolute).toBe(join(repo.root, 'apps', 'web', 'src', 'Demo.tsx'));
  });

  it('allows preflight targets that do not exist yet', () => {
    repo = createTestMonorepo();

    const ctx = resolveAppLax(repo.root, 'apps/web/src/NewFile.tsx');

    expect(ctx.appName).toBe('web');
    expect(ctx.targetFile).toBe('apps/web/src/NewFile.tsx');
  });

  it('rejects existing files outside apps', () => {
    repo = createTestMonorepo();
    writeFileSync(join(repo.root, 'package.json'), '{}', 'utf8');

    expect(() => resolveApp(repo.root, 'package.json')).toThrow(/not within an app/i);
  });
});
