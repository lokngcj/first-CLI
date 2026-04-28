// ============================================================
// preflight — output context before modifying code
// ============================================================

import { validateProject, resolveAppLax } from '../core/project-resolver.js';
import { loadRuleSet } from '../core/rules-loader.js';
import { validateRuleSources } from '../core/rules-validator.js';
import { formatOutput } from '../core/formatter.js';
import type { OutputFormat, PreflightOutput, RuleSource } from '../types/index.js';
import { detectPackageManager, resolveQualityCommand } from '../core/quality-runner.js';

export interface PreflightArgs {
  project: string;
  target: string;
  format: OutputFormat;
}

export async function preflightCommand(args: PreflightArgs): Promise<void> {
  // 1. Validate project
  const projectRoot = validateProject(args.project);

  // 2. Resolve app context (lax — target file may not exist yet)
  const ctx = resolveAppLax(projectRoot, args.target);

  // 3. Load rule set for the app
  const ruleSet = loadRuleSet(ctx.appPath, ctx.appName);

  // 4. Validate rule sources (warnings only — don't block preflight)
  const exceptions = validateRuleSources(ruleSet);
  const packageManager = detectPackageManager(projectRoot, ctx.appPath);
  const qualityCommands = [
    resolveQualityCommand('lint', packageManager, ctx.appPath, projectRoot).command,
    resolveQualityCommand('typecheck', packageManager, ctx.appPath, projectRoot).command,
    resolveQualityCommand('test', packageManager, ctx.appPath, projectRoot).command,
  ];

  // 5. Build output
  const output: PreflightOutput = {
    schemaVersion: '1.0',
    command: 'preflight',
    app: ctx.appName,
    target: ctx.targetFile!,
    styleSystem: ruleSet.styleSystem,
    ruleSources: ruleSet.sources.map(formatSource),
    qualityCommands,
    ruleSignals: ruleSet.directives,
    exceptions,
  };

  // 6. Output
  console.log(formatOutput(output, args.format));

  // Exit with error code if rule source errors exist
  if (exceptions.some((e) => e.severity === 'error')) {
    process.exitCode = 1;
  }
}

function formatSource(s: RuleSource): { path: string; type: string } {
  return { path: s.path, type: s.type };
}
