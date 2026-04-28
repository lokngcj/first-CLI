// ============================================================
// Output formatter — formats results as text, markdown, or JSON
// ============================================================
/**
 * Format a command output according to the requested format.
 */
export function formatOutput(data, format) {
    switch (format) {
        case 'json':
            return JSON.stringify(data, null, 2);
        case 'markdown':
            return formatMarkdown(data);
        case 'text':
        default:
            return formatText(data);
    }
}
// ============================================================
// Text format
// ============================================================
function formatText(data) {
    switch (data.command) {
        case 'preflight': return formatPreflightText(data);
        case 'verify': return formatVerifyText(data);
        case 'fix-suggestions': return formatFixSuggestionsText(data);
        case 'rules-check': return formatRulesCheckText(data);
        case 'figma-compress': return formatFigmaCompressText(data);
    }
}
function formatPreflightText(data) {
    const lines = [];
    lines.push('═'.repeat(50));
    lines.push('  Preflight — Context Overview');
    lines.push('═'.repeat(50));
    lines.push('');
    lines.push(`App:        ${data.app}`);
    lines.push(`Target:     ${data.target}`);
    lines.push(`Style:      ${data.styleSystem || '(not detected)'}`);
    lines.push('');
    lines.push('Rule Sources:');
    if (data.ruleSources.length === 0) {
        lines.push('  (none found)');
    }
    else {
        for (const src of data.ruleSources) {
            lines.push(`  • ${src.path}  [${src.type}]`);
        }
    }
    lines.push('');
    lines.push('Quality Commands:');
    for (const cmd of data.qualityCommands) {
        lines.push(`  • ${cmd}`);
    }
    lines.push('');
    lines.push('Rule Signals:');
    if (data.ruleSignals.length === 0) {
        lines.push('  (none extracted)');
    }
    else {
        for (const sig of data.ruleSignals) {
            lines.push(`  • ${sig}`);
        }
    }
    if (data.exceptions.length > 0) {
        lines.push('');
        lines.push('Rule Source Exceptions:');
        lines.push(formatExceptionsText(data.exceptions));
    }
    lines.push('');
    return lines.join('\n');
}
function formatVerifyText(data) {
    const lines = [];
    lines.push('═'.repeat(50));
    lines.push('  Verify — Code & Rules Check');
    lines.push('═'.repeat(50));
    lines.push('');
    lines.push(`App:    ${data.app}`);
    lines.push(`Target: ${data.target}`);
    lines.push('');
    // Exceptions first (priority)
    if (data.exceptions.length > 0) {
        lines.push('── Rule Source Exceptions ──');
        lines.push(formatExceptionsText(data.exceptions));
        lines.push('');
    }
    // Violations
    lines.push('── Code Violations ──');
    if (data.codeCheckSkipped) {
        lines.push('  ⚠ Code verification skipped — rule source errors must be resolved first.');
    }
    else if (data.violations.length === 0) {
        lines.push('  ✓ No violations found.');
    }
    else {
        lines.push(formatViolationsText(data.violations));
    }
    lines.push('');
    // Quality results
    if (data.quality) {
        lines.push('── Quality Checks ──');
        lines.push(formatQualityText(data.quality));
        lines.push('');
    }
    // Summary
    const excIcon = data.summary.exceptions > 0 ? '✗' : '✓';
    const violIcon = data.summary.violations > 0 ? '✗' : '✓';
    lines.push('── Summary ──');
    lines.push(`  ${excIcon} Exceptions: ${data.summary.exceptions}`);
    lines.push(`  ${violIcon} Violations: ${data.summary.violations}`);
    if (data.quality) {
        lines.push(`  ${data.summary.lintPassed ? '✓' : '✗'} Lint:     ${data.summary.lintPassed ? 'Passed' : 'Failed'}`);
        lines.push(`  ${data.summary.typecheckPassed ? '✓' : '✗'} TypeCheck:${data.summary.typecheckPassed ? 'Passed' : 'Failed'}`);
        lines.push(`  ${data.summary.testPassed ? '✓' : '✗'} Tests:    ${data.summary.testPassed ? 'Passed' : 'Failed'}`);
    }
    lines.push('');
    return lines.join('\n');
}
function formatFixSuggestionsText(data) {
    const lines = [];
    lines.push('═'.repeat(50));
    lines.push('  Fix Suggestions');
    lines.push('═'.repeat(50));
    lines.push('');
    lines.push(`App:    ${data.app}`);
    lines.push(`Target: ${data.target}`);
    lines.push('');
    if (data.exceptions.length > 0) {
        lines.push('── Rule Source Exceptions (fix these first) ──');
        lines.push(formatExceptionsText(data.exceptions));
        lines.push('');
    }
    if (data.suggestions.length === 0) {
        lines.push('✓ No violations found. No suggestions needed.');
    }
    else {
        lines.push(`── Suggestions (${data.suggestions.length}) ──`);
        for (let i = 0; i < data.suggestions.length; i++) {
            const s = data.suggestions[i];
            lines.push('');
            lines.push(`  ${i + 1}. [${s.violation.type}] ${s.violation.file}:${s.violation.line}`);
            lines.push(`     Issue: ${s.violation.message}`);
            lines.push(`     Fix:   ${s.description}`);
            if (s.codeSnippet) {
                lines.push(`     Code:`);
                for (const snippetLine of s.codeSnippet.split('\n')) {
                    lines.push(`       ${snippetLine}`);
                }
            }
            if (s.checklistItem) {
                lines.push(`     Step:  ${s.checklistItem}`);
            }
        }
    }
    lines.push('');
    return lines.join('\n');
}
function formatRulesCheckText(data) {
    const lines = [];
    lines.push('═'.repeat(50));
    lines.push('  Rules Check — Project Health');
    lines.push('═'.repeat(50));
    lines.push('');
    lines.push(`Project: ${data.projectRoot}`);
    lines.push(`Apps:    ${data.appCount}`);
    lines.push(`Issues:  ${data.summary.totalExceptions} exceptions across ${data.summary.appsWithIssues} apps`);
    lines.push('');
    for (const app of data.apps) {
        const hasIssues = app.exceptions.length > 0;
        lines.push(`── ${app.appName} ${hasIssues ? '✗' : '✓'} ──`);
        lines.push(`  Rule sources: ${app.ruleSources.length}`);
        if (hasIssues) {
            lines.push(formatExceptionsText(app.exceptions, '  '));
        }
        else {
            lines.push('  ✓ No issues found.');
        }
        lines.push('');
    }
    return lines.join('\n');
}
function formatFigmaCompressText(data) {
    const lines = [];
    lines.push('═'.repeat(50));
    lines.push('  Figma Compress');
    lines.push('═'.repeat(50));
    lines.push('');
    if (data.skipped) {
        lines.push(`Input:  ${data.input}`);
        lines.push(`Status: Skipped — file size (${formatBytes(data.inputSize)}) is under 1 MB threshold.`);
    }
    else {
        lines.push(`Input:       ${data.input}`);
        lines.push(`Output:      ${data.output}`);
        lines.push(`Format:      ${data.format}`);
        lines.push(`Input Size:  ${formatBytes(data.inputSize)}`);
        lines.push(`Output Size: ${formatBytes(data.outputSize)}`);
        lines.push(`Ratio:       ${data.compressionRatio.toFixed(1)}% reduction`);
        if (data.reason) {
            lines.push(`Note:        ${data.reason}`);
        }
    }
    lines.push('');
    return lines.join('\n');
}
// ============================================================
// Markdown format
// ============================================================
function formatMarkdown(data) {
    switch (data.command) {
        case 'preflight': return formatPreflightMarkdown(data);
        case 'verify': return formatVerifyMarkdown(data);
        case 'fix-suggestions': return formatFixSuggestionsMarkdown(data);
        case 'rules-check': return formatRulesCheckMarkdown(data);
        case 'figma-compress': return formatFigmaCompressMarkdown(data);
    }
}
function formatPreflightMarkdown(data) {
    const lines = [];
    lines.push('# Preflight — Context Overview');
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| App | ${data.app} |`);
    lines.push(`| Target | \`${data.target}\` |`);
    lines.push(`| Style System | ${data.styleSystem || '*(not detected)*'} |`);
    lines.push('');
    lines.push('## Rule Sources');
    if (data.ruleSources.length === 0) {
        lines.push('*(none found)*');
    }
    else {
        for (const src of data.ruleSources) {
            lines.push(`- **${src.path}** \`[${src.type}]\``);
        }
    }
    lines.push('');
    lines.push('## Quality Commands');
    for (const cmd of data.qualityCommands) {
        lines.push(`- \`${cmd}\``);
    }
    lines.push('');
    lines.push('## Rule Signals');
    if (data.ruleSignals.length === 0) {
        lines.push('*(none extracted)*');
    }
    else {
        for (const sig of data.ruleSignals) {
            lines.push(`- ${sig}`);
        }
    }
    if (data.exceptions.length > 0) {
        lines.push('');
        lines.push('## Rule Source Exceptions');
        lines.push(formatExceptionsMarkdown(data.exceptions));
    }
    return lines.join('\n');
}
function formatVerifyMarkdown(data) {
    const lines = [];
    lines.push('# Verify — Code & Rules Check');
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| App | ${data.app} |`);
    lines.push(`| Target | \`${data.target}\` |`);
    lines.push('');
    if (data.exceptions.length > 0) {
        lines.push('## Rule Source Exceptions');
        lines.push(formatExceptionsMarkdown(data.exceptions));
        lines.push('');
    }
    lines.push('## Code Violations');
    if (data.codeCheckSkipped) {
        lines.push('⚠️ **Code verification skipped** — rule source errors must be resolved first.');
    }
    else if (data.violations.length === 0) {
        lines.push('✅ No violations found.');
    }
    else {
        lines.push(formatViolationsMarkdown(data.violations));
    }
    lines.push('');
    if (data.quality) {
        lines.push('## Quality Checks');
        lines.push(formatQualityMarkdown(data.quality));
        lines.push('');
    }
    lines.push('## Summary');
    lines.push(`- Exceptions: **${data.summary.exceptions}**`);
    lines.push(`- Violations: **${data.summary.violations}**`);
    if (data.quality) {
        lines.push(`- Lint: ${data.summary.lintPassed ? '✅ Passed' : '❌ Failed'}`);
        lines.push(`- TypeCheck: ${data.summary.typecheckPassed ? '✅ Passed' : '❌ Failed'}`);
        lines.push(`- Tests: ${data.summary.testPassed ? '✅ Passed' : '❌ Failed'}`);
    }
    return lines.join('\n');
}
function formatFixSuggestionsMarkdown(data) {
    const lines = [];
    lines.push('# Fix Suggestions');
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| App | ${data.app} |`);
    lines.push(`| Target | \`${data.target}\` |`);
    lines.push('');
    if (data.exceptions.length > 0) {
        lines.push('## Rule Source Exceptions (fix these first)');
        lines.push(formatExceptionsMarkdown(data.exceptions));
        lines.push('');
    }
    if (data.suggestions.length === 0) {
        lines.push('✅ No violations found. No suggestions needed.');
    }
    else {
        lines.push('## Suggestions');
        for (let i = 0; i < data.suggestions.length; i++) {
            const s = data.suggestions[i];
            lines.push(`### ${i + 1}. [${s.violation.type}] ${s.violation.file}:${s.violation.line}`);
            lines.push('');
            lines.push(`**Issue:** ${s.violation.message}`);
            lines.push('');
            lines.push(`**Fix:** ${s.description}`);
            if (s.codeSnippet) {
                lines.push('');
                lines.push('**Code:**');
                lines.push('```ts');
                lines.push(s.codeSnippet);
                lines.push('```');
            }
            if (s.checklistItem) {
                lines.push('');
                lines.push(`**Step:** ${s.checklistItem}`);
            }
            lines.push('');
        }
    }
    return lines.join('\n');
}
function formatRulesCheckMarkdown(data) {
    const lines = [];
    lines.push('# Rules Check — Project Health');
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| Project | \`${data.projectRoot}\` |`);
    lines.push(`| Apps | ${data.appCount} |`);
    lines.push(`| Total Exceptions | ${data.summary.totalExceptions} |`);
    lines.push(`| Apps with Issues | ${data.summary.appsWithIssues} |`);
    lines.push('');
    for (const app of data.apps) {
        const hasIssues = app.exceptions.length > 0;
        lines.push(`## ${app.appName} ${hasIssues ? '❌' : '✅'}`);
        lines.push(`- Rule sources: ${app.ruleSources.length}`);
        if (hasIssues) {
            lines.push('');
            lines.push(formatExceptionsMarkdown(app.exceptions));
        }
        else {
            lines.push('- ✅ No issues found.');
        }
        lines.push('');
    }
    return lines.join('\n');
}
function formatFigmaCompressMarkdown(data) {
    const lines = [];
    lines.push('# Figma Compress');
    lines.push('');
    if (data.skipped) {
        lines.push(`- **Input:** \`${data.input}\``);
        lines.push(`- **Status:** Skipped — file size (${formatBytes(data.inputSize)}) is under 1 MB threshold.`);
    }
    else {
        lines.push(`| Field | Value |`);
        lines.push(`|-------|-------|`);
        lines.push(`| Input | \`${data.input}\` |`);
        lines.push(`| Output | \`${data.output}\` |`);
        lines.push(`| Format | ${data.format} |`);
        lines.push(`| Input Size | ${formatBytes(data.inputSize)} |`);
        lines.push(`| Output Size | ${formatBytes(data.outputSize)} |`);
        lines.push(`| Reduction | ${data.compressionRatio.toFixed(1)}% |`);
        if (data.reason) {
            lines.push(`| Note | ${data.reason} |`);
        }
    }
    return lines.join('\n');
}
// ============================================================
// Shared helpers
// ============================================================
function formatExceptionsText(exceptions, indent = '') {
    const lines = [];
    for (const exc of exceptions) {
        const icon = exc.severity === 'error' ? '✗' : '⚠';
        lines.push(`${indent}  ${icon} [${exc.severity}] [${exc.type}] ${exc.source}`);
        lines.push(`${indent}     ${exc.message}`);
    }
    return lines.join('\n');
}
function formatViolationsText(violations) {
    const lines = [];
    for (const viol of violations) {
        const icon = viol.severity === 'error' ? '✗' : '⚠';
        lines.push(`  ${icon} Line ${viol.line}: [${viol.type}] ${viol.message}`);
        lines.push(`    → ${viol.snippet}`);
    }
    return lines.join('\n');
}
function formatQualityText(quality) {
    const lines = [];
    const lintIcon = quality.lint.success ? '✓' : '✗';
    const tcIcon = quality.typecheck.success ? '✓' : '✗';
    const testIcon = quality.test.success ? '✓' : '✗';
    lines.push(`  Package Manager: ${quality.packageManager}`);
    lines.push(`  ${lintIcon} Lint:      ${quality.lint.success ? 'Passed' : 'Failed'}`);
    lines.push(`    Command: ${quality.lint.command}`);
    if (!quality.lint.success && quality.lint.error) {
        lines.push(`    → ${quality.lint.error.slice(0, 200)}`);
    }
    lines.push(`  ${tcIcon} TypeCheck:  ${quality.typecheck.success ? 'Passed' : 'Failed'}`);
    lines.push(`    Command: ${quality.typecheck.command}`);
    if (!quality.typecheck.success && quality.typecheck.error) {
        lines.push(`    → ${quality.typecheck.error.slice(0, 200)}`);
    }
    lines.push(`  ${testIcon} Tests:     ${quality.test.success ? 'Passed' : 'Failed'}`);
    lines.push(`    Command: ${quality.test.command}`);
    if (!quality.test.success && quality.test.error) {
        lines.push(`    → ${quality.test.error.slice(0, 200)}`);
    }
    if (quality.apps && quality.apps.length > 1) {
        lines.push('  Apps:');
        for (const app of quality.apps) {
            lines.push(`    - ${app.appName}: lint=${app.lint.success ? 'Passed' : 'Failed'}, typecheck=${app.typecheck.success ? 'Passed' : 'Failed'}, test=${app.test.success ? 'Passed' : 'Failed'}`);
        }
    }
    return lines.join('\n');
}
function formatExceptionsMarkdown(exceptions) {
    const lines = [];
    for (const exc of exceptions) {
        const icon = exc.severity === 'error' ? '❌' : '⚠️';
        lines.push(`- ${icon} **[${exc.severity}] [${exc.type}]** \`${exc.source}\``);
        lines.push(`  - ${exc.message}`);
    }
    return lines.join('\n');
}
function formatViolationsMarkdown(violations) {
    const lines = [];
    lines.push('| Line | Type | Severity | Message |');
    lines.push('|------|------|----------|---------|');
    for (const viol of violations) {
        const icon = viol.severity === 'error' ? '❌' : '⚠️';
        lines.push(`| ${viol.line} | \`${viol.type}\` | ${icon} ${viol.severity} | ${viol.message} |`);
    }
    return lines.join('\n');
}
function formatQualityMarkdown(quality) {
    const lines = [];
    lines.push(`Package manager: \`${quality.packageManager}\``);
    lines.push('');
    lines.push(`| Check | Status |`);
    lines.push(`|-------|--------|`);
    lines.push(`| Lint | ${quality.lint.success ? '✅ Passed' : '❌ Failed'} |`);
    lines.push(`| TypeCheck | ${quality.typecheck.success ? '✅ Passed' : '❌ Failed'} |`);
    lines.push(`| Tests | ${quality.test.success ? '✅ Passed' : '❌ Failed'} |`);
    lines.push('');
    lines.push('| Check | Command |');
    lines.push('|-------|---------|');
    lines.push(`| Lint | \`${quality.lint.command}\` |`);
    lines.push(`| TypeCheck | \`${quality.typecheck.command}\` |`);
    lines.push(`| Tests | \`${quality.test.command}\` |`);
    if (quality.apps && quality.apps.length > 1) {
        lines.push('');
        lines.push('| App | Lint | TypeCheck | Tests |');
        lines.push('|-----|------|-----------|-------|');
        for (const app of quality.apps) {
            lines.push(`| ${app.appName} | ${app.lint.success ? 'Passed' : 'Failed'} | ${app.typecheck.success ? 'Passed' : 'Failed'} | ${app.test.success ? 'Passed' : 'Failed'} |`);
        }
    }
    return lines.join('\n');
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
//# sourceMappingURL=formatter.js.map