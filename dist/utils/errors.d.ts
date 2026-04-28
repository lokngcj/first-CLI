export declare const EXIT_CODES: {
    readonly success: 0;
    readonly unexpected: 1;
    readonly usage: 2;
    readonly project: 3;
    readonly ruleSource: 4;
    readonly codeViolation: 5;
    readonly quality: 6;
    readonly image: 7;
};
export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
export declare class CliError extends Error {
    readonly exitCode: ExitCode;
    constructor(message: string, exitCode: ExitCode);
}
export declare function usageError(message: string): CliError;
export declare function projectError(message: string): CliError;
export declare function imageError(message: string): CliError;
export declare function getExitCode(err: unknown): ExitCode;
//# sourceMappingURL=errors.d.ts.map