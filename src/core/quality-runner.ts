// ============================================================
// Quality runner — executes lint, typecheck, and test commands
// using the target project's locally installed toolchain
// ============================================================

import { execSync, ExecSyncOptionsWithStringEncoding } from 'node:child_process';
import type { QualityResult } from '../types/index.js';

/**
 * Run the full quality check pipeline: lint → typecheck → test.
 * Each step uses the target project's locally installed dependencies.
 */
export function runQualityChecks(appPath: string): QualityResult {
  const result: QualityResult = {
    lint: { success: false, output: '' },
    typecheck: { success: false, output: '' },
    test: { success: false, output: '' },
  };

  // 1. Lint
  result.lint = runSingleCommand('npx eslint . --ext .ts,.tsx,.js,.jsx', appPath);

  // 2. Type check
  result.typecheck = runSingleCommand('npx tsc --noEmit', appPath);

  // 3. Tests
  result.test = runSingleCommand('npx vitest run', appPath);

  return result;
}

/**
 * Run a single shell command and capture output.
 */
function runSingleCommand(
  command: string,
  cwd: string,
): { success: boolean; output: string; error?: string } {
  const options: ExecSyncOptionsWithStringEncoding = {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
    timeout: 300_000, // 5 minute timeout
    maxBuffer: 10 * 1024 * 1024, // 10 MB
  };

  try {
    const stdout = execSync(command, options);
    return {
      success: true,
      output: stdout.trim() || '(no output)',
    };
  } catch (err: any) {
    // Command failed — collect output and error
    const stdout = (err.stdout || '').trim();
    const stderr = (err.stderr || '').trim();
    const message = err.message || '';

    // Build meaningful error output
    let output = '';
    if (stdout) output += stdout;
    if (stderr) output += (output ? '\n' : '') + stderr;
    if (!output) output = message;

    return {
      success: false,
      output: output || '(no output)',
      error: stderr || message,
    };
  }
}
