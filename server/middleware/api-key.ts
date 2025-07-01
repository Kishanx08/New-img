import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { ApiKey } from "@shared/types";

// Hard-coded admin API key (keep for backward compatibility)
const HARDCODED_API_KEY =
  "ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d";
const KEYS_FILE = path.join("uploads", "api-keys.json");
const USAGE_FILE = path.join("uploads", "usage-stats.json");

function loadApiKeys(): ApiKey[] {
  if (!fs.existsSync(KEYS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(KEYS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveApiKeys(keys: ApiKey[]) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

function loadUsageStats() {
  if (!fs.existsSync(USAGE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(USAGE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveUsageStats(stats: any) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(stats, null, 2));
}

function updateKeyUsage(apiKey: string, filename?: string, size?: number) {
  try {
    const keys = loadApiKeys();
    const keyIndex = keys.findIndex((k) => k.key === apiKey);

    if (keyIndex !== -1) {
      keys[keyIndex].usage.count++;
      keys[keyIndex].usage.lastUsed = new Date().toISOString();
      saveApiKeys(keys);
    }

    // Update usage stats for dashboard
    const usageStats = loadUsageStats();
    if (!usageStats[apiKey]) {
      usageStats[apiKey] = { uploads: [] };
    }

    if (filename && size) {
      usageStats[apiKey].uploads.push({
        timestamp: new Date().toISOString(),
        filename,
        size,
      });
    }

    saveUsageStats(usageStats);
  } catch (error) {
    console.error("Error updating key usage:", error);
  }
}

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKeyFromHeader =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.toString().replace("Bearer ", "");
  const apiKeyFromQuery = req.query.apiKey as string;
  const apiKeyFromBody = req.body?.apiKey;

  const apiKey = apiKeyFromHeader || apiKeyFromQuery || apiKeyFromBody;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key is required",
      message:
        "Please provide an API key via header 'x-api-key', 'authorization' header, query parameter 'apiKey', or in request body",
    });
  }

  // Check hard-coded admin key first
  if (apiKey === HARDCODED_API_KEY) {
    return next();
  }

  // Check user-generated API keys (old system)
  const keys = loadApiKeys();
  const validKey = keys.find((k) => k.key === apiKey);

  if (validKey) {
    // Store key info in request for later use
    (req as any).apiKeyData = validKey;
    return next();
  }

  // Check new user system API keys
  const usersFile = path.join("uploads", "users.json");
  if (fs.existsSync(usersFile)) {
    try {
      const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
      const user = users.find((u: any) => u.apiKey === apiKey);

      if (user) {
        // Store user info in request for later use
        (req as any).userData = user;
        return next();
      }
    } catch (error) {
      console.error("Error checking user API keys:", error);
    }
  }

  return res.status(403).json({
    success: false,
    error: "Invalid API key",
    message: "The provided API key is invalid",
  });
};

export const optionalApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKeyFromHeader =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.toString().replace("Bearer ", "");
  const apiKeyFromQuery = req.query.apiKey as string;
  const apiKeyFromBody = req.body?.apiKey;

  const apiKey = apiKeyFromHeader || apiKeyFromQuery || apiKeyFromBody;

  if (!apiKey) {
    return next();
  }

  // Check hard-coded admin key
  if (apiKey === HARDCODED_API_KEY) {
    return next();
  }

  // Check user-generated API keys (old system)
  const keys = loadApiKeys();
  const validKey = keys.find((k) => k.key === apiKey);

  if (validKey) {
    // Store key info in request for later use
    (req as any).apiKeyData = validKey;
    return next();
  }

  // Check new user system API keys
  const usersFile = path.join("uploads", "users.json");
  if (fs.existsSync(usersFile)) {
    try {
      const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
      const user = users.find((u: any) => u.apiKey === apiKey);

      if (user) {
        // Store user info in request for later use
        (req as any).userData = user;
        return next();
      }
    } catch (error) {
      console.error("Error checking user API keys:", error);
    }
  }

  return res.status(403).json({
    success: false,
    error: "Invalid API key",
    message: "The provided API key is invalid",
  });
};

// Middleware to track API key usage
export const trackApiKeyUsage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const originalSend = res.send;

  res.send = function (this: Response, body: any) {
    const apiKey = req.headers["x-api-key"] as string;

    if (apiKey && res.statusCode >= 200 && res.statusCode < 300) {
      // Extract filename and size from successful upload
      const filename = req.file?.filename;
      const size = req.file?.size;
      updateKeyUsage(apiKey, filename, size);
    }

    return originalSend.call(this, body);
  };

  next();
};
