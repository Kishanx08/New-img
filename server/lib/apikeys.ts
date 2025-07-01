import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ApiKeyData, UserImage } from "@shared/api";

const API_KEYS_FILE = path.join("uploads", "apikeys.json");
const IMAGES_DB_FILE = path.join("uploads", "images.json");

// Default limits
export const LIMITS = {
  ANONYMOUS_HOURLY: 5,
  API_KEY_DAILY: 50,
  PAID_API_KEY_DAILY: 1000,
};

// Load API keys from file
export function loadApiKeys(): Record<string, ApiKeyData> {
  if (!fs.existsSync(API_KEYS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(API_KEYS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

// Save API keys to file
export function saveApiKeys(apiKeys: Record<string, ApiKeyData>): void {
  fs.writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeys, null, 2));
}

// Load images database
export function loadImages(): UserImage[] {
  if (!fs.existsSync(IMAGES_DB_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(IMAGES_DB_FILE, "utf-8"));
  } catch {
    return [];
  }
}

// Save images database
export function saveImages(images: UserImage[]): void {
  fs.writeFileSync(IMAGES_DB_FILE, JSON.stringify(images, null, 2));
}

// Generate new API key
export function generateApiKey(ip: string): string {
  const apiKeys = loadApiKeys();
  const newKey = uuidv4().replace(/-/g, "");

  const apiKeyData: ApiKeyData = {
    key: newKey,
    createdAt: new Date().toISOString(),
    ip,
    uploads: 0,
    isActive: true,
  };

  apiKeys[newKey] = apiKeyData;
  saveApiKeys(apiKeys);

  return newKey;
}

// Validate API key
export function validateApiKey(key: string): ApiKeyData | null {
  const apiKeys = loadApiKeys();
  const apiKeyData = apiKeys[key];

  if (!apiKeyData || !apiKeyData.isActive) {
    return null;
  }

  return apiKeyData;
}

// Update API key usage
export function updateApiKeyUsage(key: string): void {
  const apiKeys = loadApiKeys();
  if (apiKeys[key]) {
    apiKeys[key].uploads += 1;
    apiKeys[key].lastUsed = new Date().toISOString();
    saveApiKeys(apiKeys);
  }
}

// Get API key stats
export function getApiKeyStats(key: string): ApiKeyData | null {
  return validateApiKey(key);
}

// Get user images by API key
export function getUserImages(apiKey: string): UserImage[] {
  const images = loadImages();
  return images.filter((img) => (img as any).apiKey === apiKey);
}

// Add image to database
export function addImageToDatabase(
  imageData: UserImage & { apiKey?: string },
): void {
  const images = loadImages();
  images.unshift(imageData);
  saveImages(images);
}

// Delete image
export function deleteImage(imageId: string, apiKey: string): boolean {
  const images = loadImages();
  const imageIndex = images.findIndex(
    (img) => img.id === imageId && (img as any).apiKey === apiKey,
  );

  if (imageIndex === -1) {
    return false;
  }

  const image = images[imageIndex];

  // Delete physical file
  const filePath = path.join("uploads", image.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove from database
  images.splice(imageIndex, 1);
  saveImages(images);

  return true;
}

// Regenerate API key
export function regenerateApiKey(oldKey: string, ip: string): string | null {
  const apiKeys = loadApiKeys();
  const oldKeyData = apiKeys[oldKey];

  if (!oldKeyData) {
    return null;
  }

  // Deactivate old key
  oldKeyData.isActive = false;

  // Generate new key
  const newKey = uuidv4().replace(/-/g, "");
  const newKeyData: ApiKeyData = {
    key: newKey,
    createdAt: new Date().toISOString(),
    ip,
    uploads: 0,
    isActive: true,
  };

  apiKeys[newKey] = newKeyData;
  saveApiKeys(apiKeys);

  // Update images to use new key
  const images = loadImages();
  images.forEach((img) => {
    if ((img as any).apiKey === oldKey) {
      (img as any).apiKey = newKey;
    }
  });
  saveImages(images);

  return newKey;
}
