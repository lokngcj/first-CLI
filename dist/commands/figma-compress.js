// ============================================================
// figma-compress — compress Figma-exported bitmaps
// Skips files ≤ 1 MB, compresses larger images losslessly / low-loss
// ============================================================
import { resolve, dirname, isAbsolute, join } from 'node:path';
import { copyFileSync } from 'node:fs';
import { validateProject } from '../core/project-resolver.js';
import { fileExists, getFileSize, ensureDir, getFileExtension } from '../utils/fs.js';
import { SUPPORTED_IMAGE_FORMATS, COMPRESS_THRESHOLD_BYTES } from '../utils/constants.js';
import { formatOutput } from '../core/formatter.js';
import { imageError } from '../utils/errors.js';
export async function figmaCompressCommand(args) {
    // 1. Validate project and resolve paths
    const projectRoot = validateProject(args.project);
    const inputPath = resolveFromProject(projectRoot, args.input);
    const outputPath = resolveFromProject(projectRoot, args.output);
    // 2. Validate input exists
    if (!fileExists(inputPath)) {
        throw imageError(`Input file does not exist: ${inputPath}\n` +
            `Provide a valid path to a Figma-exported bitmap file (png, jpg, jpeg, webp).`);
    }
    // 3. Validate format
    const ext = getFileExtension(inputPath);
    const supported = SUPPORTED_IMAGE_FORMATS;
    if (!supported.includes(ext)) {
        throw imageError(`Unsupported file format: .${ext}\n` +
            `Supported formats: ${supported.join(', ')}`);
    }
    // 4. Check file size
    const inputSize = getFileSize(inputPath);
    if (inputSize <= COMPRESS_THRESHOLD_BYTES) {
        const outputData = {
            schemaVersion: '1.0',
            command: 'figma-compress',
            input: inputPath,
            output: outputPath,
            inputSize,
            outputSize: inputSize,
            compressionRatio: 0,
            skipped: true,
            format: ext,
            reason: 'File size is under the 1 MB threshold.',
        };
        console.log(formatOutput(outputData, args.format));
        console.log(`File size (${formatBytes(inputSize)}) is under the 1 MB threshold. Skipping compression.`);
        return;
    }
    // 5. Run compression with sharp
    await compressImage(inputPath, outputPath, ext);
    // 6. Calculate results
    let outputSize = getFileSize(outputPath);
    let ratio = ((inputSize - outputSize) / inputSize) * 100;
    let reason;
    if (outputSize >= inputSize) {
        copyFileSync(inputPath, outputPath);
        outputSize = inputSize;
        ratio = 0;
        reason = 'Image appears already highly compressed; kept original bytes at output path.';
    }
    const outputData = {
        schemaVersion: '1.0',
        command: 'figma-compress',
        input: inputPath,
        output: outputPath,
        inputSize,
        outputSize,
        compressionRatio: Math.round(ratio * 10) / 10,
        skipped: false,
        format: ext,
        reason,
    };
    // 7. Output
    console.log(formatOutput(outputData, args.format));
}
function resolveFromProject(projectRoot, input) {
    return isAbsolute(input) ? resolve(input) : resolve(join(projectRoot, input));
}
/**
 * Compress an image file using sharp with quality settings optimized
 * for each format.
 */
async function compressImage(inputPath, outputPath, format) {
    // Dynamic import of sharp (ESM-compatible)
    const sharp = (await import('sharp')).default;
    ensureDir(dirname(outputPath));
    const image = sharp(inputPath);
    switch (format) {
        case 'png':
            await image
                .png({ quality: 80, compressionLevel: 9, palette: true })
                .toFile(outputPath);
            break;
        case 'jpg':
        case 'jpeg':
            await image
                .jpeg({ quality: 80, progressive: true, mozjpeg: true })
                .toFile(outputPath);
            break;
        case 'webp':
            await image
                .webp({ quality: 80, lossless: false })
                .toFile(outputPath);
            break;
        default:
            // Fallback: keep original format with default quality
            await image.toFile(outputPath);
    }
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
//# sourceMappingURL=figma-compress.js.map