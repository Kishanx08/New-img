# API Key Setup and Usage

This application now supports API key authentication for enhanced security and usage tracking.

## Setup

### API Key Configuration

The API key is hard-coded in the application:
```
ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d
```

No additional setup is required - the API key is automatically configured.

## API Key Usage

### Supported Methods

The API key can be provided in multiple ways:

1. **Header**: `x-api-key: ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d`
2. **Authorization Header**: `Authorization: Bearer ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d`
3. **Query Parameter**: `?apiKey=ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d`
4. **Request Body**: `{ "apiKey": "ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d" }`

### Protected Endpoints

The following endpoints require a valid API key:

- `GET /api/demo` - Demo endpoint
- `POST /api/upload` - Image upload
- `GET /api/analytics` - Usage analytics

### Public Endpoints

These endpoints are accessible without an API key:

- `GET /api/ping` - Health check

## Example Usage

### Using Headers

```bash
curl -H "x-api-key: ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d" http://localhost:3000/api/demo
```

### Using Query Parameters

```bash
curl "http://localhost:3000/api/demo?apiKey=ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d"
```

### Using Authorization Header

```bash
curl -H "Authorization: Bearer ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d" http://localhost:3000/api/demo
```

### Upload with API Key

```bash
curl -X POST \
  -H "x-api-key: ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d" \
  -F "image=@your-image.jpg" \
  http://localhost:3000/api/upload
```

## Analytics

The system tracks API key usage and provides analytics:

```bash
curl -H "x-api-key: ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d" http://localhost:3000/api/analytics
```

Response:
```json
{
  "uploads": 10,
  "apiKeyUsage": 8,
  "totalSize": 5242880,
  "apiKeyUsagePercentage": 80
}
```

## Security Notes

- API key is hard-coded and validated against the specified value
- Invalid or missing API keys return appropriate HTTP status codes (401/403)
- The system tracks which uploads used API keys for analytics purposes
- Direct URLs are used for image access (no short URLs)

## Error Responses

### Missing API Key (401)
```json
{
  "success": false,
  "error": "API key is required",
  "message": "Please provide an API key via header 'x-api-key', 'authorization' header, query parameter 'apiKey', or in request body"
}
```

### Invalid API Key (403)
```json
{
  "success": false,
  "error": "Invalid API key",
  "message": "The provided API key is invalid"
}
```

## Testing

Run the test script to verify API key functionality:

```bash
npm run test-api
```

Or with a custom API key:

```bash
node test-api.js your-custom-api-key
``` 