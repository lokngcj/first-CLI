import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

export interface TestMonorepo {
  root: string;
  cleanup: () => void;
}

export function createTestMonorepo(): TestMonorepo {
  const root = mkdtempSync(join(tmpdir(), 'atai-cli-test-'));

  mkdirSync(join(root, 'apps', 'web', 'src'), { recursive: true });
  mkdirSync(join(root, 'apps', 'admin', 'src'), { recursive: true });
  mkdirSync(join(root, 'apps', 'web', 'skills'), { recursive: true });

  writeFileSync(
    join(root, 'apps', 'web', 'PROJECT_GUIDE.md'),
    [
      '# Web Guide',
      '- must: use Tailwind for styling',
      '- never: call axios or fetch directly',
      '',
    ].join('\n'),
    'utf8',
  );

  writeFileSync(
    join(root, 'apps', 'web', 'README.md'),
    '# Web\nThis app uses tailwindcss and a unified request wrapper.\n',
    'utf8',
  );

  writeFileSync(
    join(root, 'apps', 'web', 'skills', 'api.md'),
    '- always: use the shared request wrapper for HTTP calls\n',
    'utf8',
  );

  writeFileSync(
    join(root, 'apps', 'web', 'src', 'Demo.tsx'),
    [
      "import axios from 'axios';",
      "import ky from 'ky';",
      "import { useCallback } from 'react';",
      '',
      'export function Demo() {',
      '  const handle = useCallback(() => {',
      "    console.log('提交成功');",
      '  }, []);',
      '',
      '  async function load() {',
      "    const a = await axios.get('/api/a');",
      "    const b = await fetch('/api/b');",
      '    const c = new XMLHttpRequest();',
      '    return { a, b, c, ky };',
      '  }',
      '',
      '  return <button onClick={handle}>提交成功</button>;',
      '}',
      '',
    ].join('\n'),
    'utf8',
  );

  writeFileSync(
    join(root, 'apps', 'web', 'src', 'CommentOnly.ts'),
    [
      "// import axios from 'axios'",
      "// axios.get('/api/comment')",
      "/* require('axios') */",
      "export const ok = 'ready'; // 注释中文不应触发",
      '// "注释里的中文" 不应触发',
      '',
    ].join('\n'),
    'utf8',
  );

  writeFileSync(
    join(root, 'apps', 'web', 'src', 'Demo.test.ts'),
    [
      "import axios from 'axios';",
      "const a = axios.get('/api/a');",
      "const b = fetch('/api/b');",
      '',
    ].join('\n'),
    'utf8',
  );

  writeFileSync(
    join(root, 'apps', 'admin', 'PROJECT_GUIDE.md'),
    [
      '# Admin Guide',
      'TODO: fill rules',
      '<<<<<<< HEAD',
      '- must: use Tailwind',
      '=======',
      '- must: use styled-components',
      '>>>>>>> branch',
      '',
    ].join('\n'),
    'utf8',
  );

  writeFileSync(join(root, 'apps', 'admin', 'src', 'index.ts'), 'export const ok = 1;\n', 'utf8');

  writeFileSync(
    join(root, 'small.png'),
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64',
    ),
  );

  return {
    root,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

export function initGitWithStagedFiles(root: string, files: string[]): void {
  runGit(root, ['init']);
  runGit(root, ['config', 'user.email', 'test@example.com']);
  runGit(root, ['config', 'user.name', 'Tester']);
  runGit(root, ['add', ...files]);
}

function runGit(cwd: string, args: string[]): void {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  }
}
