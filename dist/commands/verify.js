// ============================================================
// verify — check files for rule violations and optionally run
// quality checks (lint / typecheck / test)
// ============================================================
import { join } from 'node:path';
import { validateProject, resolveApp } from '../core/project-resolver.js';
import { loadRuleSet } from '../core/rules-loader.js';
import { validateRuleSources, hasErrors } from '../core/rules-validator.js';
import { checkFileViolations } from '../core/code-checker.js';
import { aggregateQualityResults, runQualityChecks } from '../core/quality-runner.js';
import { formatOutput } from '../core/formatter.js';
import { getStagedFiles } from '../utils/git.js';
import { EXIT_CODES } from '../utils/errors.js';
export async function verifyCommand(args) {
    // 1. Validate project
    const projectRoot = validateProject(args.project);
    // 2. Collect files to check
    let filesByApp;
    if (args.staged) {
        // Get all staged files from git
        const stagedFiles = await getStagedFiles(projectRoot);
        if (stagedFiles.length === 0) {
            const output = {
                schemaVersion: '1.0',
                command: 'verify',
                app: '',
                target: '<staged files>',
                exceptions: [],
                violations: [],
                codeCheckSkipped: false,
                summary: {
                    exceptions: 0,
                    violations: 0,
                },
            };
            console.log(formatOutput(output, args.format));
            return;
        }
        filesByApp = groupFilesByApp(projectRoot, stagedFiles);
    }
    else if (args.target) {
        const ctx = resolveApp(projectRoot, args.target);
        filesByApp = new Map();
        filesByApp.set(ctx.appName, {
            appPath: ctx.appPath,
            files: [ctx.targetFileAbsolute],
        });
    }
    else {
        throw new Error('Either --target or --staged must be specified.');
    }
    // 3. Process each app
    const allExceptions = [];
    const allViolations = [];
    const qualityResults = [];
    let codeCheckSkipped = false;
    let qualityResult;
    let targetDisplay = args.target || '<staged files>';
    for (const [appName, { appPath, files }] of filesByApp) {
        // Load rules
        const ruleSet = loadRuleSet(appPath, appName);
        // Validate rule sources
        const exceptions = validateRuleSources(ruleSet);
        allExceptions.push(...exceptions);
        // If rule source errors exist, skip code verification for this app
        if (hasErrors(exceptions)) {
            codeCheckSkipped = true;
            continue;
        }
        // Check each file
        for (const file of files) {
            const violations = checkFileViolations(file, ruleSet);
            allViolations.push(...violations);
        }
        // Run quality checks per app so staged changes across apps are represented accurately.
        if (args.quality) {
            console.error(`Running quality checks for ${appName} (lint -> typecheck -> test)...`);
            console.error('This may take a while depending on project size.\n');
            qualityResults.push(runQualityChecks(appPath, projectRoot, appName));
        }
    }
    qualityResult = aggregateQualityResults(qualityResults);
    // 4. Build output
    const output = {
        schemaVersion: '1.0',
        command: 'verify',
        app: [...filesByApp.keys()].join(', '),
        target: targetDisplay,
        exceptions: allExceptions,
        violations: allViolations,
        codeCheckSkipped,
        quality: qualityResult,
        summary: {
            exceptions: allExceptions.length,
            violations: allViolations.length,
            lintPassed: qualityResult?.lint.success,
            typecheckPassed: qualityResult?.typecheck.success,
            testPassed: qualityResult?.test.success,
        },
    };
    // 5. Output
    console.log(formatOutput(output, args.format));
    // Exit code based on results
    if (allExceptions.some((e) => e.severity === 'error')) {
        process.exitCode = EXIT_CODES.ruleSource;
    }
    else if (allViolations.some((v) => v.severity === 'error')) {
        process.exitCode = EXIT_CODES.codeViolation;
    }
    else if (qualityResult &&
        (!qualityResult.lint.success || !qualityResult.typecheck.success || !qualityResult.test.success)) {
        process.exitCode = EXIT_CODES.quality;
    }
}
/**
 * Group a list of file paths by their parent app under apps/.
 */
function groupFilesByApp(projectRoot, filePaths) {
    const map = new Map();
    for (const fp of filePaths) {
        const normalized = fp.replace(/\\/g, '/');
        const parts = normalized.split('/');
        if (parts[0] !== 'apps' || parts.length < 3)
            continue;
        const appName = parts[1];
        const absolutePath = join(projectRoot, normalized);
        if (!map.has(appName)) {
            map.set(appName, { appPath: join(projectRoot, 'apps', appName), files: [] });
        }
        map.get(appName).files.push(absolutePath);
    }
    return map;
}
//# sourceMappingURL=verify.js.map