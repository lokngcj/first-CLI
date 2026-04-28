// ============================================================
// rules-check — scan all apps for rule source health
// ============================================================

import { join } from 'node:path';
import { validateProject, listApps } from '../core/project-resolver.js';
import { loadRuleSet } from '../core/rules-loader.js';
import { validateRuleSources } from '../core/rules-validator.js';
import { formatOutput } from '../core/formatter.js';
import { isDirectory } from '../utils/fs.js';
import { EXIT_CODES } from '../utils/errors.js';
import type { OutputFormat, RulesCheckOutput, AppHealth } from '../types/index.js';

export interface RulesCheckArgs {
  project: string;
  format: OutputFormat;
}

export async function rulesCheckCommand(args: RulesCheckArgs): Promise<void> {
  // 1. Validate project
  const projectRoot = validateProject(args.project);

  // 2. List all apps
  const appNames = listApps(projectRoot);

  if (appNames.length === 0) {
    console.log('No apps found under apps/ directory.');
    return;
  }

  // 3. Scan each app
  const apps: AppHealth[] = [];

  for (const appName of appNames) {
    const appPath = join(projectRoot, 'apps', appName);

    if (!isDirectory(appPath)) continue;

    const ruleSet = loadRuleSet(appPath, appName);
    const exceptions = validateRuleSources(ruleSet);

    apps.push({
      appName,
      appPath,
      ruleSources: ruleSet.sources.map((s) => ({ path: s.path, type: s.type })),
      exceptions,
    });
  }

  // 4. Build summary
  const totalExceptions = apps.reduce((sum, a) => sum + a.exceptions.length, 0);
  const appsWithIssues = apps.filter((a) => a.exceptions.length > 0).length;

  const output: RulesCheckOutput = {
    schemaVersion: '1.0',
    command: 'rules-check',
    projectRoot,
    appCount: apps.length,
    apps,
    summary: {
      totalExceptions,
      appsWithIssues,
    },
  };

  // 5. Output
  console.log(formatOutput(output, args.format));

  if (totalExceptions > 0) {
    process.exitCode = EXIT_CODES.ruleSource;
  }
}
