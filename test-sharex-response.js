import FormData from 'form-data';
import fetch from 'node-fetch';

const API_KEY = '23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca';

async function testShareXResponse() {
  console.log('Testing ShareX response format...');
  
  // Create a simple test image (1x1 pixel PNG)
  const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(testImageData, 'base64');
  
  const form = new FormData();
  form.append('image', buffer, {
    filename: 'test.png',
    contentType: 'image/png'
  });

  try {
    const response = await fetch('http://localhost:8080/api/upload', {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.url) {
      console.log('✅ ShareX response format is correct!');
      console.log('URL field:', data.url);
      console.log('This should work with ShareX configuration: $json:url$');
    } else {
      console.log('❌ Response format is incorrect for ShareX');
    }
  } catch (error) {
    console.error('Error testing ShareX response:', error);
  }
}

testShareXResponse(); 