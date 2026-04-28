export const EXIT_CODES = {
    success: 0,
    unexpected: 1,
    usage: 2,
    project: 3,
    ruleSource: 4,
    codeViolation: 5,
    quality: 6,
    image: 7,
};
export class CliError extends Error {
    exitCode;
    constructor(message, exitCode) {
        super(message);
        this.name = 'CliError';
        this.exitCode = exitCode;
    }
}
export function usageError(message) {
    return new CliError(message, EXIT_CODES.usage);
}
export function projectError(message) {
    return new CliError(message, EXIT_CODES.project);
}
export function imageError(message) {
    return new CliError(message, EXIT_CODES.image);
}
export function getExitCode(err) {
    if (err instanceof CliError)
        return err.exitCode;
    return EXIT_CODES.unexpected;
}
//# sourceMappingURL=errors.js.map