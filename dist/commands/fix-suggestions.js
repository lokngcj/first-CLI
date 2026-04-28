// ============================================================
// fix-suggestions — generate actionable fix suggestions for
// code violations, with optional code snippets and checklists
// ============================================================
import { validateProject, resolveApp } from '../core/project-resolver.js';
import { loadRuleSet } from '../core/rules-loader.js';
import { validateRuleSources, hasErrors } from '../core/rules-validator.js';
import { checkFileViolations } from '../core/code-checker.js';
import { formatOutput } from '../core/formatter.js';
export async function fixSuggestionsCommand(args) {
    // 1. Validate project
    const projectRoot = validateProject(args.project);
    // 2. Resolve app and file
    const ctx = resolveApp(projectRoot, args.target);
    // 3. Load rule set
    const ruleSet = loadRuleSet(ctx.appPath, ctx.appName);
    // 4. Validate rule sources
    const exceptions = validateRuleSources(ruleSet);
    // Rule source errors block fix suggestions
    if (hasErrors(exceptions)) {
        const output = {
            command: 'fix-suggestions',
            app: ctx.appName,
            target: ctx.targetFile,
            exceptions,
            suggestions: [],
        };
        console.log(formatOutput(output, args.format));
        const message = 'Fix rule source errors before generating code suggestions.';
        if (args.format === 'json') {
            console.error(message);
        }
        else {
            console.log(`\n${message}`);
        }
        process.exitCode = 1;
        return;
    }
    // 5. Check violations
    const violations = checkFileViolations(ctx.targetFileAbsolute, ruleSet);
    // 6. Generate suggestions
    const suggestions = violations.map((v) => generateSuggestion(v, args));
    // 7. Build output
    const output = {
        command: 'fix-suggestions',
        app: ctx.appName,
        target: ctx.targetFile,
        exceptions,
        suggestions,
    };
    // 8. Output
    console.log(formatOutput(output, args.format));
    if (violations.length > 0) {
        process.exitCode = 1;
    }
}
/**
 * Generate a fix suggestion for a single violation.
 */
function generateSuggestion(violation, args) {
    const suggestion = {
        violation,
        description: getFixDescription(violation),
    };
    if (args.withSnippets) {
        suggestion.codeSnippet = getFixSnippet(violation);
    }
    if (args.applyChecklist) {
        suggestion.checklistItem = getChecklistItem(violation);
    }
    return suggestion;
}
function getFixDescription(v) {
    switch (v.type) {
        case 'direct_axios':
            return 'Replace the direct axios import/call with the project unified request wrapper. Locate the shared API service module (commonly @/services/api or @/utils/request) and use its exported request methods instead.';
        case 'direct_fetch':
            return 'Replace the direct fetch() call with the project unified request wrapper. If the wrapper does not support a needed use case, extend the wrapper rather than bypassing it.';
        case 'i18n_hardcoding':
            return 'Replace the hardcoded Chinese text with an i18n translation function call. Add the translation key to the locale JSON files and use t("key") or the equivalent i18n hook.';
        case 'useCallback_abuse':
            return 'Remove the useCallback wrapper if the wrapped function is stable (does not depend on frequently changing values) OR if the component receiving it as a prop is not memoized with React.memo. Only use useCallback when actually needed for referential stability.';
        case 'nonstandard_api_call':
            return 'Replace the non-standard API call with the project unified request wrapper. Follow the established pattern used by other API calls in the project.';
    }
}
function getFixSnippet(v) {
    switch (v.type) {
        case 'direct_axios':
            return `// Before (remove):
import axios from 'axios';
const res = await axios.get('/api/data');

// After (use wrapper):
import { api } from '@/services/api';
const res = await api.get('/api/data');`;
        case 'direct_fetch':
            return `// Before (remove):
const res = await fetch('/api/data');

// After (use wrapper):
import { api } from '@/services/api';
const res = await api.get('/api/data');`;
        case 'i18n_hardcoding':
            return `// Before (remove):
<span>提交成功</span>

// After (use i18n):
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<span>{t('submit.success')}</span>

// Also add to locale JSON:
// zh-CN: { "submit": { "success": "提交成功" } }
// en:    { "submit": { "success": "Submitted successfully" } }`;
        case 'useCallback_abuse':
            return `// Before (unnecessary useCallback):
const handleClick = useCallback(() => {
  doSomething();
}, []);

// After (simpler, equivalent unless child is memoized):
const handleClick = () => {
  doSomething();
};`;
        case 'nonstandard_api_call':
            return `// Before (remove):
import axios from 'axios';
const res = await axios.post('/api/submit', data);

// After (use wrapper):
import { api } from '@/services/api';
const res = await api.post('/api/submit', data);`;
    }
}
function getChecklistItem(v) {
    switch (v.type) {
        case 'direct_axios':
            return `[ ] Line ${v.line}: Replace axios call with project API wrapper. Import the wrapper, update the call site, and verify the response shape matches.`;
        case 'direct_fetch':
            return `[ ] Line ${v.line}: Replace fetch() with project API wrapper. Check that error handling and response parsing are consistent.`;
        case 'i18n_hardcoding':
            return `[ ] Line ${v.line}: Extract hardcoded text to i18n. Add translation keys to locale files for all supported languages, update the component to use the t() function.`;
        case 'useCallback_abuse':
            return `[ ] Line ${v.line}: Evaluate if useCallback is needed. Check if the callback is passed to a memoized child — if not, remove useCallback.`;
        case 'nonstandard_api_call':
            return `[ ] Line ${v.line}: Standardize API call to use project wrapper. Match the pattern used by other API calls in the same app.`;
    }
}
//# sourceMappingURL=fix-suggestions.js.map