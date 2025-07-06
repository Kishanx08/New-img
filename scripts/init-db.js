// Database initialization script
import fs from 'fs';
import path from 'path';

const uploadsDir = 'uploads';

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize users.json with default structure
const defaultUsers = [
  {
    "id": "b9645844-befa-43cd-8ebe-c2f42326137f",
    "username": "Root",
    "passwordHash": "$2b$12$JoMF.EXgG3/z6x0MxET5L.q6pe/fBuRfC5.ThhDS9Bt19grSh3D2e",
    "apiKey": "ad0a265df1384899923e529909c50d49",
    "createdAt": "2025-07-01T08:31:13.456Z",
    "createdIp": "::ffff:127.0.0.1",
    "limits": {
      "dailyLimit": 100,
      "hourlyLimit": 25
    },
    "usage": {
      "count": 0
    },
    "uploadsFolder": "uploads/users/Root",
    "watermarkSettings": {
      "enabled": true,
      "text": "x02.me",
      "position": "bottom-right",
      "opacity": 0.6,
      "fontSize": 20,
      "color": "#ffffff",
      "padding": 15,
      "async": false,
      "fastMode": false
    }
  }
];

// Initialize other JSON files
const defaultAnalytics = {
  "totalUploads": 0,
  "apiKeyUploads": 0,
  "anonymousUploads": 0,
  "totalSize": 0
};

const defaultRateLimits = {};

const defaultUsageStats = {};

const defaultApiKeys = [];

const defaultShortlinks = {};

// Function to initialize a JSON file if it doesn't exist
function initJsonFile(filename, defaultData) {
  const filepath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
    console.log(`✅ Created ${filename}`);
  } else {
    console.log(`ℹ️  ${filename} already exists`);
  }
}

// Initialize all database files
console.log('🚀 Initializing database files...');

initJsonFile('users.json', defaultUsers);
initJsonFile('analytics.json', defaultAnalytics);
initJsonFile('rate-limits.json', defaultRateLimits);
initJsonFile('usage-stats.json', defaultUsageStats);
initJsonFile('api-keys.json', defaultApiKeys);
initJsonFile('shortlinks.json', defaultShortlinks);

// Create user directories
const userDirs = ['users/Root', 'users/Kishan'];
userDirs.forEach(dir => {
  const dirpath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

console.log('🎉 Database initialization complete!'); 