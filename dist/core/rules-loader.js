// ============================================================
// Rules loader — finds and loads all rule source files for an app
// ============================================================
import { join, relative } from 'node:path';
import { readdirSync } from 'node:fs';
import { isDirectory, isFile, readFile, walkDir } from '../utils/fs.js';
import { STYLE_SYSTEM_INDICATORS } from '../utils/constants.js';
/**
 * Find all rule source files under the app directory.
 * Scope is strictly limited to documented patterns.
 */
export function findRuleSources(appPath) {
    const sources = [];
    // skills/**/*.md
    const skillsDir = join(appPath, 'skills');
    if (isDirectory(skillsDir)) {
        const files = walkDir(skillsDir, (f) => f.endsWith('.md'));
        for (const file of files) {
            sources.push({
                path: relative(appPath, file).replace(/\\/g, '/'),
                type: 'skills',
                content: readFile(file),
            });
        }
    }
    // PROJECT_GUIDE.md
    const guidePath = join(appPath, 'PROJECT_GUIDE.md');
    if (isFile(guidePath)) {
        sources.push({
            path: 'PROJECT_GUIDE.md',
            type: 'project_guide',
            content: readFile(guidePath),
        });
    }
    // README.md
    const readmePath = join(appPath, 'README.md');
    if (isFile(readmePath)) {
        sources.push({
            path: 'README.md',
            type: 'readme',
            content: readFile(readmePath),
        });
    }
    // .serena/** (all files)
    const serenaDir = join(appPath, '.serena');
    if (isDirectory(serenaDir)) {
        const files = walkDir(serenaDir);
        for (const file of files) {
            sources.push({
                path: relative(appPath, file).replace(/\\/g, '/'),
                type: 'serena',
                content: readFile(file),
            });
        }
    }
    // .trae/** (all files)
    const traeDir = join(appPath, '.trae');
    if (isDirectory(traeDir)) {
        const files = walkDir(traeDir);
        for (const file of files) {
            sources.push({
                path: relative(appPath, file).replace(/\\/g, '/'),
                type: 'trae',
                content: readFile(file),
            });
        }
    }
    // Feature docs: ai.md, router.md, *.logic.md, DEV_STEPS.md, *compat-plan.md
    const appRootEntries = readdirSync(appPath, { withFileTypes: true });
    for (const entry of appRootEntries) {
        if (!entry.isFile())
            continue;
        const name = entry.name;
        if (name === 'ai.md' ||
            name === 'router.md' ||
            name === 'DEV_STEPS.md' ||
            name.endsWith('.logic.md') ||
            name.endsWith('compat-plan.md')) {
            sources.push({
                path: name,
                type: 'feature_doc',
                content: readFile(join(appPath, name)),
            });
        }
    }
    return sources;
}
/**
 * Detect which style system is in use based on rule source content.
 * Returns null if none detected, or "conflict: <list>" if multiple detected.
 */
export function detectStyleSystem(sources) {
    const allContent = sources.map((s) => s.content).join('\n');
    const detected = [];
    for (const indicator of STYLE_SYSTEM_INDICATORS) {
        if (indicator.patterns.some((p) => p.test(allContent))) {
            detected.push(indicator.name);
        }
    }
    if (detected.length === 0)
        return null;
    if (detected.length === 1)
        return detected[0];
    return `conflict: ${detected.join(', ')}`;
}
/**
 * Extract rule directives from sources.
 * Matches lines like "- must: use Tailwind" or "* should: follow ESLint config".
 */
export function extractDirectives(sources) {
    const directives = [];
    const directiveRe = /^[-*]\s+(must|should|always|never|require|ensure):?\s+(.+)$/gim;
    for (const source of sources) {
        let match;
        directiveRe.lastIndex = 0;
        while ((match = directiveRe.exec(source.content)) !== null) {
            directives.push(`[${source.path}] ${match[1]}: ${match[2]}`);
        }
    }
    return directives;
}
/**
 * Load the complete rule set for a given app.
 */
export function loadRuleSet(appPath, appName) {
    const sources = findRuleSources(appPath);
    const styleSystem = detectStyleSystem(sources);
    const directives = extractDirectives(sources);
    return {
        appName,
        appPath,
        sources,
        styleSystem,
        directives,
    };
}
//# sourceMappingURL=rules-loader.js.map