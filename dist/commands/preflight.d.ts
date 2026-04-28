import type { OutputFormat } from '../types/index.js';
export interface PreflightArgs {
    project: string;
    target: string;
    format: OutputFormat;
}
export declare function preflightCommand(args: PreflightArgs): Promise<void>;
//# sourceMappingURL=preflight.d.ts.map