import type { OutputFormat } from '../types/index.js';
export interface FixSuggestionsArgs {
    project: string;
    target: string;
    format: OutputFormat;
    withSnippets?: boolean;
    applyChecklist?: boolean;
}
export declare function fixSuggestionsCommand(args: FixSuggestionsArgs): Promise<void>;
//# sourceMappingURL=fix-suggestions.d.ts.map