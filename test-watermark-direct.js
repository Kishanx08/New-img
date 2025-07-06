// Direct test of watermarking functionality
import fs from 'fs';
import sharp from 'sharp';
import { createCanvas, registerFont } from 'canvas';

async function testWatermarking() {
  console.log('🧪 Testing watermarking functionality directly...');
  
  try {
    // Create a simple test image using Sharp
    const testImageBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .png()
    .toBuffer();
    
    console.log(`Created test image: ${testImageBuffer.length} bytes`);
    
    // Save the test image
    fs.writeFileSync('./test-image.png', testImageBuffer);
    
    // Test watermarking logic directly
    console.log('📝 Adding watermark...');
    
    // Get image metadata
    const metadata = await sharp(testImageBuffer).metadata();
    console.log(`Image metadata:`, metadata);
    const { width = 200, height = 200 } = metadata;

    // Create watermark canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set font
    ctx.font = `20px Arial, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;

    // Calculate text position (bottom-right)
    const text = 'x02.me';
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    const padding = 15;

    const x = width - textWidth - padding;
    const y = height - padding;

    // Add text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw watermark text
    ctx.fillText(text, x, y);

    // Convert canvas to buffer
    const watermarkBuffer = canvas.toBuffer('image/png');
    console.log(`Watermark buffer: ${watermarkBuffer.length} bytes`);

    // Composite watermark onto original image
    const watermarkedImage = await sharp(testImageBuffer)
      .composite([
        {
          input: watermarkBuffer,
          top: 0,
          left: 0,
        }
      ])
      .png({ quality: 90 })
      .toBuffer();

    console.log(`Watermarked image: ${watermarkedImage.length} bytes`);
    
    // Save the watermarked image
    fs.writeFileSync('./test-watermarked.png', watermarkedImage);
    
    console.log('✅ Watermarking test completed!');
    console.log('📁 Check test-watermarked.png to see the watermark');
    
  } catch (error) {
    console.error('❌ Watermarking test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testWatermarking(); 