// ============================================================
// Code checker - scans source files for rule violations
// ============================================================
import { relative } from 'node:path';
import { readFile, matchesAnyPattern } from '../utils/fs.js';
import { VIOLATION_PATTERNS, EXEMPT_FILE_PATTERNS } from '../utils/constants.js';
/**
 * Check a single file for all code rule violations.
 * Test files are exempt from the unified request wrapper checks.
 */
export function checkFileViolations(absolutePath, ruleSet) {
    const violations = [];
    let content;
    try {
        content = readFile(absolutePath);
    }
    catch {
        return violations;
    }
    if (!isSourceFile(absolutePath))
        return violations;
    const lines = content.split('\n');
    const relativePath = relative(ruleSet.appPath, absolutePath).replace(/\\/g, '/');
    const isRequestCheckExempt = matchesAnyPattern(absolutePath, EXEMPT_FILE_PATTERNS);
    let inBlockComment = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        const stripped = stripCommentsFromLine(line, inBlockComment);
        const codeLine = stripped.code;
        inBlockComment = stripped.inBlockComment;
        const hasCode = codeLine.trim().length > 0;
        if (!isRequestCheckExempt && hasCode) {
            checkPattern(codeLine, VIOLATION_PATTERNS.directAxiosImport, () => {
                violations.push(makeViolation(relativePath, lineNum, line, 'direct_axios', 'Direct axios import detected. Use the project unified request wrapper instead of importing axios directly.'));
            });
            checkPattern(codeLine, VIOLATION_PATTERNS.directAxiosRequire, () => {
                violations.push(makeViolation(relativePath, lineNum, line, 'direct_axios', 'Direct axios require detected. Use the project unified request wrapper instead.'));
            });
            checkPattern(codeLine, VIOLATION_PATTERNS.directAxiosCall, () => {
                violations.push(makeViolation(relativePath, lineNum, line, 'direct_axios', 'Direct axios method call detected. Replace with the project unified request wrapper.'));
            });
            checkPattern(codeLine, VIOLATION_PATTERNS.directFetch, () => {
                violations.push(makeViolation(relativePath, lineNum, line, 'direct_fetch', 'Direct fetch() call detected. Use the project unified request wrapper instead.'));
            });
            checkPattern(codeLine, VIOLATION_PATTERNS.nonstandardHttpImport, () => {
                violations.push(makeViolation(relativePath, lineNum, line, 'nonstandard_api_call', 'Non-standard HTTP client import detected. Use the project unified request wrapper instead.'));
            });
            checkPattern(codeLine, VIOLATION_PATTERNS.xmlHttpRequest, () => {
                violations.push(makeViolation(relativePath, lineNum, line, 'nonstandard_api_call', 'XMLHttpRequest usage detected. Use the project unified request wrapper instead.'));
            });
        }
        const chineseRe = VIOLATION_PATTERNS.chineseChars;
        chineseRe.lastIndex = 0;
        let cmatch;
        while ((cmatch = chineseRe.exec(codeLine)) !== null) {
            if (hasStringContext(codeLine, cmatch.index)) {
                violations.push(makeViolation(relativePath, lineNum, line, 'i18n_hardcoding', 'Hardcoded Chinese text detected. Replace with i18n translation function call (e.g., t("key") or i18n.t("key")).'));
                break;
            }
        }
        if (hasCode) {
            checkPattern(codeLine, VIOLATION_PATTERNS.useCallback, () => {
                violations.push(makeViolation(relativePath, lineNum, line, 'useCallback_abuse', 'useCallback usage detected. Verify that memoization is necessary; wrapping stable functions in useCallback adds overhead without benefit.', 'warning'));
            });
        }
    }
    return violations;
}
function stripCommentsFromLine(line, startsInBlockComment) {
    let code = '';
    let quote = null;
    let escaped = false;
    let inBlockComment = startsInBlockComment;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];
        if (inBlockComment) {
            if (char === '*' && next === '/') {
                inBlockComment = false;
                i++;
            }
            continue;
        }
        if (quote) {
            code += char;
            if (escaped) {
                escaped = false;
            }
            else if (char === '\\') {
                escaped = true;
            }
            else if (char === quote) {
                quote = null;
            }
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            quote = char;
            code += char;
            continue;
        }
        if (char === '/' && next === '/') {
            break;
        }
        if (char === '/' && next === '*') {
            inBlockComment = true;
            i++;
            continue;
        }
        code += char;
    }
    return { code, inBlockComment };
}
function checkPattern(line, regex, onMatch) {
    regex.lastIndex = 0;
    if (regex.test(line)) {
        onMatch();
    }
}
function makeViolation(file, line, snippet, type, message, severity = 'error') {
    return {
        file,
        line,
        column: 0,
        type,
        message,
        source: 'code-rules',
        severity,
        snippet: snippet.trim().slice(0, 120),
    };
}
function hasStringContext(line, pos) {
    const before = line.slice(0, pos);
    const after = line.slice(pos);
    const inQuotes = (before.match(/(['"`])[^'"`]*$/) !== null) &&
        (after.match(/^[^'"`]*['"`]/) !== null);
    const inJSXText = />[^<]*$/.test(before) && /^[^>]*</.test(after);
    const inTemplate = before.includes('`') && after.includes('`');
    return inQuotes || inJSXText || inTemplate;
}
function isSourceFile(filePath) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte'];
    return extensions.some((ext) => filePath.endsWith(ext));
}
//# sourceMappingURL=code-checker.js.map