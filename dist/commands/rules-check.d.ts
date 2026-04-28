import type { OutputFormat } from '../types/index.js';
export interface RulesCheckArgs {
    project: string;
    format: OutputFormat;
}
export declare function rulesCheckCommand(args: RulesCheckArgs): Promise<void>;
//# sourceMappingURL=rules-check.d.ts.map