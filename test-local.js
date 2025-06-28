const http = require('http');

const API_KEY = '23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca';

// Test local API key validation
function testLocalApiKey() {
  console.log('🔍 Testing local API key validation...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-key',
    method: 'GET',
    headers: {
      'X-API-Key': API_KEY,
      'User-Agent': 'X02-Test/1.0'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('✅ Local API key test completed\n');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
    console.log('💡 Make sure your server is running with: npm run dev');
  });

  req.end();
}

// Test without API key (should fail)
function testWithoutApiKey() {
  console.log('🔍 Testing without API key (should fail)...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-key',
    method: 'GET',
    headers: {
      'User-Agent': 'X02-Test/1.0'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('✅ No API key test completed (should show 401)\n');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
  });

  req.end();
}

// Run tests
console.log('🚀 Starting local API tests...\n');
console.log('Make sure your server is running with: npm run dev\n');

testLocalApiKey();

// Wait a bit then test without API key
setTimeout(() => {
  testWithoutApiKey();
}, 2000); 