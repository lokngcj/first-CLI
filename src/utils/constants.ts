// ============================================================
// Constants used across the atai-ai CLI tool
// ============================================================

/** Supported image formats for figma-compress */
export const SUPPORTED_IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'webp'] as const;

/** File size threshold for compression (1 MB in bytes) */
export const COMPRESS_THRESHOLD_BYTES = 1 * 1024 * 1024;

/** Glob patterns for rule source files, relative to app directory */
export const RULE_SOURCE_PATTERNS = {
  skills: 'skills/**/*.md',
  projectGuide: 'PROJECT_GUIDE.md',
  readme: 'README.md',
  serena: '.serena/**/*',
  trae: '.trae/**/*',
  featureDocs: [
    'ai.md',
    'router.md',
    '*.logic.md',
    'DEV_STEPS.md',
    '*compat-plan.md',
  ],
} as const;

/** File patterns exempt from "unified request writing" check */
export const EXEMPT_FILE_PATTERNS = [
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
];

/** Git merge conflict markers to detect in rule sources */
export const CONFLICT_MARKERS = [
  /^<<<<<<< /m,
  /^=======/m,
  /^>>>>>>> /m,
  /<!--\s*CONFLICT\s*-->/i,
];

/** Regex patterns for detecting code violations */
export const VIOLATION_PATTERNS = {
  /** Direct import of axios */
  directAxiosImport: /import\s+.*\s+from\s+['"]axios['"]/g,
  /** require('axios') */
  directAxiosRequire: /require\s*\(\s*['"]axios['"]\s*\)/g,
  /** Direct axios method calls: axios.get, axios.post, etc. */
  directAxiosCall: /\baxios\.(get|post|put|delete|patch|request|head|options)\s*\(/g,
  /** Direct fetch() calls */
  directFetch: /\bfetch\s*\(/g,
  /** Imports of common non-project HTTP client libraries */
  nonstandardHttpImport: /import\s+.*\s+from\s+['"](ky|got|superagent|umi-request|request)['"]/g,
  /** Common browser API call that bypasses the unified request wrapper */
  xmlHttpRequest: /\bnew\s+XMLHttpRequest\s*\(/g,
  /** Chinese characters (for i18n hardcoding detection) */
  chineseChars: /[一-鿿㐀-䶿]+/g,
  /** useCallback wrapping */
  useCallback: /useCallback\s*\(/g,
};

/** Style system indicators to detect in rule sources */
export const STYLE_SYSTEM_INDICATORS = [
  { name: 'tailwind', patterns: [/tailwind/i, /tailwindcss/i, /@tailwind/i, /@apply\b/] },
  { name: 'styled-components', patterns: [/styled-components/i, /styled\.\w+/] },
  { name: 'css-modules', patterns: [/\.module\.css/i, /css-modules/i] },
  { name: 'sass/scss', patterns: [/\.scss\b/i, /\.sass\b/i, /node-sass/i, /dart-sass/i] },
  { name: 'less', patterns: [/\.less\b/i] },
  { name: 'vanilla-extract', patterns: [/vanilla-extract/i, /\.css\.ts\b/] },
  { name: 'emotion', patterns: [/@emotion/i, /emotion\/react/i] },
] as const;

/** Quality check commands executed in order */
export const QUALITY_COMMANDS = {
  lint: 'npx eslint',
  typecheck: 'npx tsc --noEmit',
  test: 'npx vitest run',
} as const;

/** Required monorepo directory name */
export const APPS_DIR = 'apps';
