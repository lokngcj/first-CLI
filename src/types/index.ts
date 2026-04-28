// ============================================================
// Core domain types for atai-ai CLI tool
// ============================================================

/** Identified application context within a monorepo */
export interface AppContext {
  /** Absolute path to the monorepo root */
  projectRoot: string;
  /** App directory name under apps/ */
  appName: string;
  /** Absolute path to the app directory */
  appPath: string;
  /** Relative file path from project root (if a target file was specified) */
  targetFile?: string;
  /** Absolute path to the target file */
  targetFileAbsolute?: string;
}

/** A loaded rule source file */
export interface RuleSource {
  /** Relative path from app root */
  path: string;
  /** File type category */
  type: 'skills' | 'project_guide' | 'readme' | 'serena' | 'trae' | 'feature_doc' | 'unknown';
  /** Raw file content */
  content: string;
}

/** Merged rule set for a single app */
export interface RuleSet {
  appName: string;
  appPath: string;
  /** All loaded rule sources */
  sources: RuleSource[];
  /** Detected style system (e.g. tailwind, styled-components, css-modules) */
  styleSystem: string | null;
  /** Key directives extracted from rules */
  directives: string[];
}

/** Types of rules source exceptions */
export type ExceptionType =
  | 'conflict_marker'
  | 'guide_mismatch'
  | 'style_conflict'
  | 'rule_missing';

/** A rules source exception (has priority over code violations) */
export interface RulesException {
  type: ExceptionType;
  source: string;
  message: string;
  severity: 'error' | 'warning';
}

/** Types of code rule violations */
export type ViolationType =
  | 'direct_axios'
  | 'direct_fetch'
  | 'i18n_hardcoding'
  | 'useCallback_abuse'
  | 'nonstandard_api_call';

/** A code rule violation found during scanning */
export interface RulesViolation {
  file: string;
  line: number;
  column: number;
  type: ViolationType;
  message: string;
  source: string;
  severity: 'error' | 'warning';
  /** The violating code snippet */
  snippet: string;
}

/** A fix suggestion for a specific violation */
export interface FixSuggestion {
  violation: RulesViolation;
  description: string;
  /** Code snippet showing the fix */
  codeSnippet?: string;
  /** Step-by-step checklist item */
  checklistItem?: string;
}

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/** Result from one quality check command */
export interface QualityStepResult {
  success: boolean;
  command: string;
  cwd: string;
  output: string;
  error?: string;
}

/** Result from running quality checks for a single app */
export interface AppQualityResult {
  appName: string;
  appPath: string;
  packageManager: PackageManager;
  lint: QualityStepResult;
  typecheck: QualityStepResult;
  test: QualityStepResult;
}

/** Aggregated result from running quality checks */
export interface QualityResult {
  packageManager: PackageManager | 'mixed';
  lint: QualityStepResult;
  typecheck: QualityStepResult;
  test: QualityStepResult;
  apps?: AppQualityResult[];
}

/** Output from the preflight command */
export interface PreflightOutput {
  schemaVersion: '1.0';
  command: 'preflight';
  app: string;
  target: string;
  styleSystem: string | null;
  ruleSources: { path: string; type: string }[];
  qualityCommands: string[];
  ruleSignals: string[];
  exceptions: RulesException[];
}

/** Output from the verify command */
export interface VerifyOutput {
  schemaVersion: '1.0';
  command: 'verify';
  app: string;
  target: string;
  exceptions: RulesException[];
  violations: RulesViolation[];
  codeCheckSkipped: boolean;
  quality?: QualityResult;
  summary: {
    exceptions: number;
    violations: number;
    lintPassed?: boolean;
    typecheckPassed?: boolean;
    testPassed?: boolean;
  };
}

/** Output from the fix-suggestions command */
export interface FixSuggestionsOutput {
  schemaVersion: '1.0';
  command: 'fix-suggestions';
  app: string;
  target: string;
  exceptions: RulesException[];
  suggestions: FixSuggestion[];
}

/** Per-app health status in rules-check */
export interface AppHealth {
  appName: string;
  appPath: string;
  ruleSources: { path: string; type: string }[];
  exceptions: RulesException[];
}

/** Output from the rules-check command */
export interface RulesCheckOutput {
  schemaVersion: '1.0';
  command: 'rules-check';
  projectRoot: string;
  appCount: number;
  apps: AppHealth[];
  summary: {
    totalExceptions: number;
    appsWithIssues: number;
  };
}

/** Output from the figma-compress command */
export interface FigmaCompressOutput {
  schemaVersion: '1.0';
  command: 'figma-compress';
  input: string;
  output: string;
  inputSize: number;
  outputSize: number;
  compressionRatio: number;
  skipped: boolean;
  format: string;
  reason?: string;
}

/** Union of all possible command outputs */
export type CommandOutput =
  | PreflightOutput
  | VerifyOutput
  | FixSuggestionsOutput
  | RulesCheckOutput
  | FigmaCompressOutput;

/** Supported output formats */
export type OutputFormat = 'text' | 'markdown' | 'json';
