import sharp from 'sharp';
import { createCanvas } from 'canvas';
import fs from 'fs';
import { pipeline } from 'stream/promises';
export class FastUploadService {
    static async processImageStream(inputPath, outputPath, watermarkOptions, fastMode = false) {
        try {
            // Create Sharp instance with optimizations
            const sharpInstance = sharp(inputPath, {
                failOnError: false,
                limitInputPixels: false
            });
            // Apply fast mode optimizations
            if (fastMode) {
                // Resize large images for faster processing
                const metadata = await sharpInstance.metadata();
                if (metadata.width && metadata.width > 1500) {
                    sharpInstance.resize(1500, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    });
                }
            }
            // Create watermark
            const watermarkBuffer = await this.createWatermarkBuffer(await sharpInstance.metadata(), watermarkOptions);
            // Process image with watermark
            const processedImage = sharpInstance
                .composite([
                {
                    input: watermarkBuffer,
                    top: 0,
                    left: 0,
                }
            ])
                .png({
                quality: fastMode ? 75 : 85,
                compressionLevel: fastMode ? 9 : 6,
                progressive: false,
                force: true
            });
            // Stream to output file
            await pipeline(processedImage, fs.createWriteStream(outputPath));
        }
        catch (error) {
            console.error('Fast upload processing error:', error);
            throw error;
        }
    }
    static async createWatermarkBuffer(metadata, options) {
        const { width = 800, height = 600 } = metadata;
        // Create watermark canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        // Set font
        ctx.font = `${options.fontSize}px Arial, sans-serif`;
        ctx.fillStyle = options.color;
        ctx.globalAlpha = options.opacity;
        // Calculate text position
        const textMetrics = ctx.measureText(options.text);
        const textWidth = textMetrics.width;
        const textHeight = options.fontSize;
        let x, y;
        switch (options.position) {
            case 'top-left':
                x = options.padding;
                y = options.padding + textHeight;
                break;
            case 'top-right':
                x = width - textWidth - options.padding;
                y = options.padding + textHeight;
                break;
            case 'bottom-left':
                x = options.padding;
                y = height - options.padding;
                break;
            case 'bottom-right':
                x = width - textWidth - options.padding;
                y = height - options.padding;
                break;
            case 'center':
                x = (width - textWidth) / 2;
                y = (height + textHeight) / 2;
                break;
            default:
                x = width - textWidth - options.padding;
                y = height - options.padding;
        }
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        // Draw watermark text
        ctx.fillText(options.text, x, y);
        // Convert canvas to buffer
        return canvas.toBuffer('image/png');
    }
}
