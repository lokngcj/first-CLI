import { describe, expect, it } from 'vitest';
import { formatOutput } from '../../src/core/formatter.js';
import type { VerifyOutput } from '../../src/types/index.js';

describe('formatter', () => {
  it('formats json output as parseable structured data', () => {
    const output: VerifyOutput = {
      schemaVersion: '1.0',
      command: 'verify',
      app: 'web',
      target: 'apps/web/src/Demo.tsx',
      exceptions: [],
      violations: [],
      codeCheckSkipped: false,
      summary: {
        exceptions: 0,
        violations: 0,
      },
    };

    const formatted = formatOutput(output, 'json');

    expect(JSON.parse(formatted)).toMatchObject({
      command: 'verify',
      app: 'web',
      summary: {
        exceptions: 0,
        violations: 0,
      },
    });
  });
});
