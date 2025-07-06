// Simple test to verify watermarking works
import fs from 'fs';
import { WatermarkService } from './dist/server/utils/watermark.js';

async function testWatermarking() {
  console.log('🧪 Testing watermarking functionality...');
  
  try {
    // Create a simple test image using Sharp
    const sharp = (await import('sharp')).default;
    
    // Create a simple test image (100x100 red square)
    const testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .png()
    .toBuffer();
    
    console.log(`Created test image: ${testImageBuffer.length} bytes`);
    
    // Save the test image
    fs.writeFileSync('./test-image.png', testImageBuffer);
    
    // Test watermarking
    const watermarkService = WatermarkService.getInstance();
    
    console.log('📝 Adding watermark...');
    
    const watermarkedImage = await watermarkService.addWatermark(testImageBuffer, {
      text: 'x02.me',
      position: 'bottom-right',
      opacity: 0.8,
      fontSize: 16,
      color: '#ffffff',
      padding: 10
    });
    
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