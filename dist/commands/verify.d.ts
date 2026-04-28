import type { OutputFormat } from '../types/index.js';
export interface VerifyArgs {
    project: string;
    target?: string;
    staged?: boolean;
    quality?: boolean;
    format: OutputFormat;
}
export declare function verifyCommand(args: VerifyArgs): Promise<void>;
//# sourceMappingURL=verify.d.ts.map