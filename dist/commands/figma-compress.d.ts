import type { OutputFormat } from '../types/index.js';
export interface FigmaCompressArgs {
    project: string;
    input: string;
    output: string;
    format: OutputFormat;
}
export declare function figmaCompressCommand(args: FigmaCompressArgs): Promise<void>;
//# sourceMappingURL=figma-compress.d.ts.map