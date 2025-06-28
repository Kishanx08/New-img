# ShareX Setup Guide for X02 Image Host

## 🔐 API Key Protection

Your image hosting platform is now secured with API key authentication. The API key is:
```
23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca
```

⚠️ **Keep this key secure and never share it publicly!**

## 📋 ShareX Configuration

### Method 1: Import Configuration File
1. Download the `sharex-config.sxcu` file
2. Open ShareX
3. Go to **Destinations** → **Image Uploader** → **Import**
4. Select the `sharex-config.sxcu` file
5. Update the `RequestURL` to your actual domain (replace `your-domain.netlify.app`)

### Method 2: Manual Configuration
1. Open ShareX
2. Go to **Destinations** → **Image Uploader** → **Add**
3. Configure the following settings:

#### Basic Settings
- **Name**: X02 Image Host
- **Request Method**: POST
- **Request URL**: `https://your-domain.netlify.app/api/upload`

#### Headers
- **X-API-Key**: `23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca`

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

1. **401 Unauthorized**: Check that the API key is correct in the headers
2. **403 Forbidden**: Verify the API key matches exactly
3. **File too large**: Maximum file size is 30MB
4. **Invalid file type**: Only image files are supported

### Testing the API

You can test the API using curl:
```bash
curl -X POST \
  -H "X-API-Key: 23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca" \
  -F "image=@your-image.jpg" \
  https://your-domain.netlify.app/api/upload
```

## 🔒 Security Notes

- The API key is required for all uploads
- Keep your API key private and secure
- Consider rotating the API key periodically
- Monitor upload logs for suspicious activity

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

1. Deploy your site to Netlify
2. Update the `RequestURL` in ShareX with your actual domain
3. Test uploads with ShareX
4. Enjoy secure image hosting! 🚀 