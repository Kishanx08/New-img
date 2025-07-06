// Simple test script to verify watermarking functionality
import fs from 'fs';
import path from 'path';
import { WatermarkService } from './server/utils/watermark.js';

async function testWatermarking() {
  console.log('🧪 Testing watermarking functionality...');
  
  try {
    // Create a simple test image (you can replace this with an actual image)
    const testImagePath = './test-image.jpg';
    
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️  No test image found. Please add a test image named "test-image.jpg" to test watermarking.');
      return;
    }
    
    const imageBuffer = fs.readFileSync(testImagePath);
    const watermarkService = WatermarkService.getInstance();
    
    console.log('📝 Adding watermark...');
    
    // Test different watermark configurations
    const watermarkedImage = await watermarkService.addWatermark(imageBuffer, {
      text: 'x02.me',
      position: 'bottom-right',
      opacity: 0.7,
      fontSize: 24,
      color: '#ffffff',
      padding: 20
    });
    
    // Save the watermarked image
    const outputPath = './test-watermarked.jpg';
    fs.writeFileSync(outputPath, watermarkedImage);
    
    console.log('✅ Watermarking test completed!');
    console.log(`📁 Original: ${testImagePath}`);
    console.log(`📁 Watermarked: ${outputPath}`);
    console.log('🔍 Check the watermarked image to see the "x02.me" watermark in the bottom-right corner.');
    
  } catch (error) {
    console.error('❌ Watermarking test failed:', error);
  }
}

testWatermarking(); 