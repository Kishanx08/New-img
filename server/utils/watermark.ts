import sharp from 'sharp';
import { createCanvas, registerFont } from 'canvas';
import path from 'path';

interface WatermarkOptions {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
  padding: number;
}

export class WatermarkService {
  private static instance: WatermarkService;
  
  private constructor() {
    // Register custom font if available
    try {
      registerFont(path.join(__dirname, '../assets/fonts/Inter-Bold.ttf'), { family: 'Inter-Bold' });
    } catch (error) {
      console.log('Custom font not found, using default');
    }
  }

  public static getInstance(): WatermarkService {
    if (!WatermarkService.instance) {
      WatermarkService.instance = new WatermarkService();
    }
    return WatermarkService.instance;
  }

  async addWatermark(
    imageBuffer: Buffer,
    options: WatermarkOptions = {
      text: 'x02.me',
      position: 'bottom-right',
      opacity: 0.7,
      fontSize: 24,
      color: '#ffffff',
      padding: 20
    },
    fastMode: boolean = false
  ): Promise<Buffer> {
    try {
      // Validate input
      if (!imageBuffer || imageBuffer.length === 0) {
        console.error('Invalid image buffer: buffer is empty or null');
        throw new Error('Invalid image buffer');
      }
      
      console.log(`Watermarking image: ${imageBuffer.length} bytes`);
      
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      console.log(`Image metadata:`, metadata);
      const { width = 800, height = 600 } = metadata;

      // Calculate text dimensions
      const canvas = createCanvas(1, 1); // Temporary canvas for text measurement
      const ctx = canvas.getContext('2d');
      ctx.font = `${options.fontSize}px Inter-Bold, Arial, sans-serif`;
      const textMetrics = ctx.measureText(options.text);
      const textWidth = textMetrics.width;
      const textHeight = options.fontSize;

      // Calculate watermark position
      let x: number, y: number;

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

      // Debug: Log the options being used
      console.log('🔍 Watermark options received:', {
        text: options.text,
        fontSize: options.fontSize,
        color: options.color,
        opacity: options.opacity,
        position: options.position,
        padding: options.padding
      });

      // Create watermark using Sharp's text overlay
      const watermarkSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.8)"/>
            </filter>
          </defs>
          <text 
            x="${x}" 
            y="${y}" 
            font-family="Inter-Bold, Arial, sans-serif" 
            font-size="${options.fontSize}px" 
            fill="${options.color}" 
            opacity="${options.opacity}"
            filter="url(#shadow)"
            style="font-weight: bold;"
          >${options.text}</text>
        </svg>
      `;

      console.log('🔍 Generated SVG watermark:', watermarkSvg);

      // Composite watermark onto original image with optimized settings
      const sharpInstance = sharp(imageBuffer, { 
        failOnError: false,
        limitInputPixels: false 
      });

      // Apply fast mode optimizations
      if (fastMode) {
        // Resize large images for faster processing
        const metadata = await sharpInstance.metadata();
        if (metadata.width && metadata.width > 2000) {
          sharpInstance.resize(2000, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          });
        }
      }

      const watermarkedImage = await sharpInstance
        .composite([
          {
            input: Buffer.from(watermarkSvg),
            top: 0,
            left: 0,
          }
        ])
        .png({ 
          quality: fastMode ? 80 : 85,  // Lower quality in fast mode
          compressionLevel: fastMode ? 8 : 6,  // Faster compression in fast mode
          progressive: false,  // Disable progressive for speed
          force: true
        })
        .toBuffer();

      return watermarkedImage;
    } catch (error) {
      console.error('Watermarking error:', error);
      // Return original image if watermarking fails
      return imageBuffer;
    }
  }

  async addLogoWatermark(
    imageBuffer: Buffer,
    logoPath: string,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right',
    opacity: number = 0.8,
    size: number = 100
  ): Promise<Buffer> {
    try {
      // Resize logo
      const logoBuffer = await sharp(logoPath)
        .resize(size, size, { fit: 'inside' })
        .png()
        .toBuffer();

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      const { width = 800, height = 600 } = metadata;

      // Calculate logo position
      let top: number, left: number;
      const padding = 20;

      switch (position) {
        case 'top-left':
          top = padding;
          left = padding;
          break;
        case 'top-right':
          top = padding;
          left = width - size - padding;
          break;
        case 'bottom-left':
          top = height - size - padding;
          left = padding;
          break;
        case 'bottom-right':
          top = height - size - padding;
          left = width - size - padding;
          break;
        default:
          top = height - size - padding;
          left = width - size - padding;
      }

      // Composite logo onto image
      const watermarkedImage = await sharp(imageBuffer)
        .composite([
          {
            input: logoBuffer,
            top,
            left,
          }
        ])
        .png({ quality: 90 })
        .toBuffer();

      return watermarkedImage;
    } catch (error) {
      console.error('Logo watermarking error:', error);
      return imageBuffer;
    }
  }
} 