#!/usr/bin/env node
// ============================================================
// atai-ai — CLI workflow tool for Monorepo frontend projects
// ============================================================
import { Command } from 'commander';
import { preflightCommand } from './commands/preflight.js';
import { verifyCommand } from './commands/verify.js';
import { fixSuggestionsCommand } from './commands/fix-suggestions.js';
import { rulesCheckCommand } from './commands/rules-check.js';
import { figmaCompressCommand } from './commands/figma-compress.js';
import { EXIT_CODES, getExitCode, usageError } from './utils/errors.js';
const program = new Command();
program
    .name('atai-ai')
    .description('CLI workflow tool for frontend Monorepo projects (apps/* structure).\n' +
    'Provides pre-change context, rule verification, fix suggestions,\n' +
    'project-wide rules health checks, and Figma bitmap compression.')
    .version('1.0.0');
// ============================================================
// preflight — Output context before modifying code
// ============================================================
program
    .command('preflight')
    .description('Output target file context: app, style system, rule sources, quality commands')
    .requiredOption('--project <path>', 'Absolute path to the Monorepo project root')
    .requiredOption('--target <path>', 'Relative or absolute path to the target file')
    .option('--format <fmt>', 'Output format: text, markdown, json', 'text')
    .action(async (options) => {
    try {
        await preflightCommand({
            project: options.project,
            target: options.target,
            format: parseFormat(options.format),
        });
    }
    catch (err) {
        console.error(`\nError: ${err.message}`);
        process.exit(getExitCode(err));
    }
});
// ============================================================
// verify — Check files for rule violations + optional quality
// ============================================================
program
    .command('verify')
    .description('Verify target/staged files against project rules, with optional quality checks')
    .requiredOption('--project <path>', 'Absolute path to the Monorepo project root')
    .option('--target <path>', 'Path to a single file to verify')
    .option('--staged', 'Verify all files in the git staging area')
    .option('--quality', 'Run lint, typecheck, and tests after rule verification')
    .option('--format <fmt>', 'Output format: text, markdown, json', 'text')
    .action(async (options) => {
    // Validate mutually exclusive + one required
    if (!options.target && !options.staged) {
        console.error('Error: Either --target or --staged must be specified.');
        process.exit(EXIT_CODES.usage);
    }
    if (options.target && options.staged) {
        console.error('Error: --target and --staged are mutually exclusive. Specify one.');
        process.exit(EXIT_CODES.usage);
    }
    try {
        await verifyCommand({
            project: options.project,
            target: options.target,
            staged: options.staged,
            quality: options.quality,
            format: parseFormat(options.format),
        });
    }
    catch (err) {
        console.error(`\nError: ${err.message}`);
        process.exit(getExitCode(err));
    }
});
// ============================================================
// fix-suggestions — Generate actionable fix suggestions
// ============================================================
program
    .command('fix-suggestions')
    .description('Generate fix suggestions for rule violations with optional snippets and checklists')
    .requiredOption('--project <path>', 'Absolute path to the Monorepo project root')
    .requiredOption('--target <path>', 'Path to the target file')
    .option('--format <fmt>', 'Output format: text, markdown, json', 'text')
    .option('--with-snippets', 'Include copyable code snippets in suggestions')
    .option('--apply-checklist', 'Include a step-by-step fix checklist')
    .action(async (options) => {
    try {
        await fixSuggestionsCommand({
            project: options.project,
            target: options.target,
            format: parseFormat(options.format),
            withSnippets: options.withSnippets,
            applyChecklist: options.applyChecklist,
        });
    }
    catch (err) {
        console.error(`\nError: ${err.message}`);
        process.exit(getExitCode(err));
    }
});
// ============================================================
// rules-check — Project-wide rules health scan
// ============================================================
program
    .command('rules-check')
    .description('Scan all apps for rule source health issues')
    .requiredOption('--project <path>', 'Absolute path to the Monorepo project root')
    .option('--format <fmt>', 'Output format: text, markdown, json', 'text')
    .action(async (options) => {
    try {
        await rulesCheckCommand({
            project: options.project,
            format: parseFormat(options.format),
        });
    }
    catch (err) {
        console.error(`\nError: ${err.message}`);
        process.exit(getExitCode(err));
    }
});
// ============================================================
// figma-compress — Compress Figma-exported bitmaps
// ============================================================
program
    .command('figma-compress')
    .description('Compress Figma-exported bitmaps (png, jpg, jpeg, webp) — skips files ≤ 1 MB')
    .requiredOption('--project <path>', 'Absolute path to the Monorepo project root')
    .requiredOption('--input <path>', 'Path to the original bitmap file')
    .requiredOption('--output <path>', 'Path for the compressed output file')
    .action(async (options) => {
    try {
        await figmaCompressCommand({
            project: options.project,
            input: options.input,
            output: options.output,
            format: 'text',
        });
    }
    catch (err) {
        console.error(`\nError: ${err.message}`);
        process.exit(getExitCode(err));
    }
});
// ============================================================
// Parse and run
// ============================================================
program.parse(process.argv);
// If no command specified, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
// ============================================================
// Helpers
// ============================================================
function parseFormat(value) {
    const normalized = value.toLowerCase();
    if (normalized === 'text' || normalized === 'markdown' || normalized === 'json') {
        return normalized;
    }
    throw usageError(`Invalid format: ${value}. Supported formats: text, markdown, json`);
}
//# sourceMappingURL=index.js.map