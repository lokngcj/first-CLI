export const EXIT_CODES = {
  success: 0,
  unexpected: 1,
  usage: 2,
  project: 3,
  ruleSource: 4,
  codeViolation: 5,
  quality: 6,
  image: 7,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

export class CliError extends Error {
  readonly exitCode: ExitCode;

  constructor(message: string, exitCode: ExitCode) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}

export function usageError(message: string): CliError {
  return new CliError(message, EXIT_CODES.usage);
}

export function projectError(message: string): CliError {
  return new CliError(message, EXIT_CODES.project);
}

export function imageError(message: string): CliError {
  return new CliError(message, EXIT_CODES.image);
}

export function getExitCode(err: unknown): ExitCode {
  if (err instanceof CliError) return err.exitCode;
  return EXIT_CODES.unexpected;
}
