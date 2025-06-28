# ShareX Setup Guide for X02 Image Host

## 🔐 API Key Protection

Your image hosting platform is now secured with API key authentication. The API key is:
```
23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca
```

⚠️ **Keep this key secure and never share it publicly!**

## 📋 ShareX Configuration

### Method 1: Import Configuration File (Recommended)
1. Download the `sharex-config.sxcu` file
2. Open ShareX
3. Go to **Destinations** → **Image Uploader** → **Import**
4. Select the `sharex-config.sxcu` file
5. The configuration is already set up for your domain: `https://x02.me`

### Method 2: Alternative Configuration (if Method 1 fails)
If you're getting "unauthorized" errors, try the alternative configuration:
1. Download the `sharex-config-alternative.sxcu` file
2. Import it into ShareX instead
3. This uses Bearer token authentication

### Method 3: Manual Configuration
1. Open ShareX
2. Go to **Destinations** → **Image Uploader** → **Add**
3. Configure the following settings:

#### Basic Settings
- **Name**: X02 Image Host
- **Request Method**: POST
- **Request URL**: `https://x02.me/api/upload`

#### Headers (Option A - X-API-Key)
- **X-API-Key**: `23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca`

#### Headers (Option B - Authorization Bearer)
- **Authorization**: `Bearer 23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca`

#### Body
- **Body Type**: Multipart form data
- **File Form Name**: `image`

#### Response
- **Response Type**: JSON
- **URL**: `$json:url$`
- **Thumbnail URL**: `$json:url$`

## 🚀 Usage

Once configured, you can:
- **Screenshot**: Press `PrtScn` or `Shift + PrtScn`
- **Upload File**: Right-click any image file → **ShareX** → **Upload**
- **Drag & Drop**: Drag images directly to ShareX

## 🔧 Troubleshooting

### Common Issues

1. **401 Unauthorized / API key required**:
   - Try the alternative configuration file (`sharex-config-alternative.sxcu`)
   - Check that the API key is exactly: `23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca`
   - Try using Authorization header instead of X-API-Key

2. **403 Forbidden / Invalid API key**:
   - Verify the API key matches exactly (no extra spaces)
   - Check if there are any hidden characters
   - Try copying the key again from the config file

3. **Connection Refused**: 
   - Check if your VM server is running
   - Verify the domain is accessible at https://x02.me

4. **File too large**: Maximum file size is 30MB
5. **Invalid file type**: Only image files are supported

### Testing the API

You can test the API using curl:

**Test with X-API-Key header:**
```bash
curl -X POST \
  -H "X-API-Key: 23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca" \
  -F "image=@your-image.jpg" \
  https://x02.me/api/upload
```

**Test with Authorization header:**
```bash
curl -X POST \
  -H "Authorization: Bearer 23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca" \
  -F "image=@your-image.jpg" \
  https://x02.me/api/upload
```

**Test API key validation endpoint:**
```bash
curl -H "X-API-Key: 23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca" \
  https://x02.me/api/test-key
```

### Debug Steps

1. **Check server logs** for detailed error messages
2. **Test with curl** first to verify the API works
3. **Try both header formats** (X-API-Key and Authorization)
4. **Verify the domain** is accessible and responding

## 🔒 Security Notes

- The API key is required for all uploads
- Keep your API key private and secure
- Consider rotating the API key periodically
- Monitor upload logs for suspicious activity
- Your domain uses HTTPS for secure connections

## 📝 Response Format

Successful uploads return:
```json
{
  "success": true,
  "imageId": "filename_01.jpg",
  "url": "/api/images/filename_01.jpg",
  "originalName": "original-filename.jpg",
  "size": 1234567,
  "uploadedAt": "2024-01-01T12:00:00.000Z",
  "shortUrl": "/i/ABC123"
}
```

## 🎯 Next Steps

1. **Try the main config** file (`sharex-config.sxcu`)
2. **If that fails, try the alternative** (`sharex-config-alternative.sxcu`)
3. **Test with curl** to verify the API works
4. **Check server logs** for detailed error messages
5. **Enjoy secure image hosting** at https://x02.me! 🚀

## 🌐 Your Domain

Your image hosting platform is live at: **https://x02.me/** 