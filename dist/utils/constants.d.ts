/** Supported image formats for figma-compress */
export declare const SUPPORTED_IMAGE_FORMATS: readonly ["png", "jpg", "jpeg", "webp"];
/** File size threshold for compression (1 MB in bytes) */
export declare const COMPRESS_THRESHOLD_BYTES: number;
/** Glob patterns for rule source files, relative to app directory */
export declare const RULE_SOURCE_PATTERNS: {
    readonly skills: "skills/**/*.md";
    readonly projectGuide: "PROJECT_GUIDE.md";
    readonly readme: "README.md";
    readonly serena: ".serena/**/*";
    readonly trae: ".trae/**/*";
    readonly featureDocs: readonly ["ai.md", "router.md", "*.logic.md", "DEV_STEPS.md", "*compat-plan.md"];
};
/** File patterns exempt from "unified request writing" check */
export declare const EXEMPT_FILE_PATTERNS: RegExp[];
/** Git merge conflict markers to detect in rule sources */
export declare const CONFLICT_MARKERS: RegExp[];
/** Regex patterns for detecting code violations */
export declare const VIOLATION_PATTERNS: {
    /** Direct import of axios */
    directAxiosImport: RegExp;
    /** require('axios') */
    directAxiosRequire: RegExp;
    /** Direct axios method calls: axios.get, axios.post, etc. */
    directAxiosCall: RegExp;
    /** Direct fetch() calls */
    directFetch: RegExp;
    /** Imports of common non-project HTTP client libraries */
    nonstandardHttpImport: RegExp;
    /** Common browser API call that bypasses the unified request wrapper */
    xmlHttpRequest: RegExp;
    /** Chinese characters (for i18n hardcoding detection) */
    chineseChars: RegExp;
    /** useCallback wrapping */
    useCallback: RegExp;
};
/** Style system indicators to detect in rule sources */
export declare const STYLE_SYSTEM_INDICATORS: readonly [{
    readonly name: "tailwind";
    readonly patterns: readonly [RegExp, RegExp, RegExp, RegExp];
}, {
    readonly name: "styled-components";
    readonly patterns: readonly [RegExp, RegExp];
}, {
    readonly name: "css-modules";
    readonly patterns: readonly [RegExp, RegExp];
}, {
    readonly name: "sass/scss";
    readonly patterns: readonly [RegExp, RegExp, RegExp, RegExp];
}, {
    readonly name: "less";
    readonly patterns: readonly [RegExp];
}, {
    readonly name: "vanilla-extract";
    readonly patterns: readonly [RegExp, RegExp];
}, {
    readonly name: "emotion";
    readonly patterns: readonly [RegExp, RegExp];
}];
/** Quality check commands executed in order */
export declare const QUALITY_COMMANDS: {
    readonly lint: "npx eslint";
    readonly typecheck: "npx tsc --noEmit";
    readonly test: "npx vitest run";
};
/** Required monorepo directory name */
export declare const APPS_DIR = "apps";
//# sourceMappingURL=constants.d.ts.map