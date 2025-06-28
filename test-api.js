const https = require('https');
const fs = require('fs');
const FormData = require('form-data');

const API_KEY = '23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca';
const BASE_URL = 'https://x02.me';

// Test 1: Test API key validation endpoint
function testApiKey() {
  console.log('🔍 Testing API key validation...');
  
  const options = {
    hostname: 'x02.me',
    port: 443,
    path: '/api/test-key',
    method: 'GET',
    headers: {
      'X-API-Key': API_KEY,
      'User-Agent': 'X02-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('✅ API key test completed\n');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
  });

  req.end();
}

// Test 2: Test upload endpoint
function testUpload() {
  console.log('📤 Testing upload endpoint...');
  
  const form = new FormData();
  form.append('image', fs.createReadStream('public/placeholder.svg'));
  
  const options = {
    hostname: 'x02.me',
    port: 443,
    path: '/api/upload',
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      ...form.getHeaders()
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('✅ Upload test completed\n');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
  });

  form.pipe(req);
}

// Run tests
console.log('🚀 Starting API tests...\n');
testApiKey();

// Wait a bit then test upload
setTimeout(() => {
  testUpload();
}, 2000); 