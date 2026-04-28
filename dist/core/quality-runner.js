// ============================================================
// Quality runner - executes lint, typecheck, and test commands
// using the target project's locally installed toolchain.
// ============================================================
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
/**
 * Run the full quality check pipeline: lint -> typecheck -> test.
 * Commands are inferred from app/root package.json scripts first, then
 * fall back to local package-manager execution.
 */
export function runQualityChecks(appPath, projectRoot = appPath, appName = '') {
    const packageManager = detectPackageManager(projectRoot, appPath);
    const lintPlan = resolveQualityCommand('lint', packageManager, appPath, projectRoot);
    const typecheckPlan = resolveQualityCommand('typecheck', packageManager, appPath, projectRoot);
    const testPlan = resolveQualityCommand('test', packageManager, appPath, projectRoot);
    return {
        appName,
        appPath,
        packageManager,
        lint: runSingleCommand(lintPlan.command, lintPlan.cwd),
        typecheck: runSingleCommand(typecheckPlan.command, typecheckPlan.cwd),
        test: runSingleCommand(testPlan.command, testPlan.cwd),
    };
}
export function aggregateQualityResults(results) {
    if (results.length === 0)
        return undefined;
    if (results.length === 1) {
        const [result] = results;
        return {
            packageManager: result.packageManager,
            lint: result.lint,
            typecheck: result.typecheck,
            test: result.test,
            apps: results,
        };
    }
    return {
        packageManager: allSame(results.map((r) => r.packageManager))
            ? results[0].packageManager
            : 'mixed',
        lint: aggregateStep('lint', results),
        typecheck: aggregateStep('typecheck', results),
        test: aggregateStep('test', results),
        apps: results,
    };
}
export function detectPackageManager(projectRoot, appPath = projectRoot) {
    const candidates = [
        ['pnpm', ['pnpm-lock.yaml']],
        ['yarn', ['yarn.lock']],
        ['bun', ['bun.lockb', 'bun.lock']],
        ['npm', ['package-lock.json']],
    ];
    for (const [manager, lockFiles] of candidates) {
        if (lockFiles.some((file) => existsSync(join(projectRoot, file))))
            return manager;
    }
    for (const [manager, lockFiles] of candidates) {
        if (lockFiles.some((file) => existsSync(join(appPath, file))))
            return manager;
    }
    return 'npm';
}
export function resolveQualityCommand(kind, packageManager, appPath, projectRoot) {
    const scriptNames = getScriptCandidates(kind);
    const appPackage = readPackageJson(appPath);
    const appScript = findScript(appPackage, scriptNames);
    if (appScript) {
        return { command: buildRunScriptCommand(packageManager, appScript), cwd: appPath };
    }
    const rootPackage = readPackageJson(projectRoot);
    const rootScript = findScript(rootPackage, scriptNames);
    if (rootScript) {
        return { command: buildRunScriptCommand(packageManager, rootScript), cwd: projectRoot };
    }
    return { command: buildFallbackCommand(packageManager, kind), cwd: appPath };
}
function runSingleCommand(command, cwd) {
    const options = {
        cwd,
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 300_000,
        maxBuffer: 10 * 1024 * 1024,
    };
    try {
        const stdout = execSync(command, options);
        return {
            success: true,
            command,
            cwd,
            output: stdout.trim() || '(no output)',
        };
    }
    catch (err) {
        const stdout = (err.stdout || '').trim();
        const stderr = (err.stderr || '').trim();
        const message = err.message || '';
        let output = '';
        if (stdout)
            output += stdout;
        if (stderr)
            output += (output ? '\n' : '') + stderr;
        if (!output)
            output = message;
        return {
            success: false,
            command,
            cwd,
            output: output || '(no output)',
            error: stderr || message,
        };
    }
}
function aggregateStep(kind, results) {
    const steps = results.map((result) => result[kind]);
    return {
        success: steps.every((step) => step.success),
        command: '<multiple apps>',
        cwd: '<multiple apps>',
        output: steps
            .map((step, index) => `[${results[index].appName || results[index].appPath}] ${step.output}`)
            .join('\n\n'),
        error: steps
            .filter((step) => !step.success && step.error)
            .map((step, index) => `[${results[index].appName || results[index].appPath}] ${step.error}`)
            .join('\n') || undefined,
    };
}
function readPackageJson(dir) {
    const packagePath = join(dir, 'package.json');
    if (!existsSync(packagePath))
        return null;
    try {
        return JSON.parse(readFileSync(packagePath, 'utf8'));
    }
    catch {
        return null;
    }
}
function findScript(packageJson, candidates) {
    if (!packageJson?.scripts)
        return null;
    return candidates.find((name) => Boolean(packageJson.scripts?.[name])) ?? null;
}
function getScriptCandidates(kind) {
    switch (kind) {
        case 'lint':
            return ['lint', 'eslint'];
        case 'typecheck':
            return ['typecheck', 'type-check', 'tsc'];
        case 'test':
            return ['test', 'test:run', 'vitest'];
    }
}
function buildRunScriptCommand(packageManager, script) {
    switch (packageManager) {
        case 'npm':
            return `npm run ${script}`;
        case 'pnpm':
            return `pnpm run ${script}`;
        case 'yarn':
            return `yarn run ${script}`;
        case 'bun':
            return `bun run ${script}`;
    }
}
function buildFallbackCommand(packageManager, kind) {
    const binary = getFallbackBinary(kind);
    const executor = getExecutor(packageManager);
    return `${executor} ${binary}`;
}
function getFallbackBinary(kind) {
    switch (kind) {
        case 'lint':
            return 'eslint . --ext .ts,.tsx,.js,.jsx';
        case 'typecheck':
            return 'tsc --noEmit';
        case 'test':
            return 'vitest run';
    }
}
function getExecutor(packageManager) {
    switch (packageManager) {
        case 'npm':
            return 'npx';
        case 'pnpm':
            return 'pnpm exec';
        case 'yarn':
            return 'yarn';
        case 'bun':
            return 'bunx';
    }
}
function allSame(values) {
    return values.every((value) => value === values[0]);
}
//# sourceMappingURL=quality-runner.js.map