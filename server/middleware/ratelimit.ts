import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { LIMITS, validateApiKey } from "../lib/apikeys";

const RATE_LIMIT_FILE = path.join("uploads", "ratelimits.json");

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

// Load rate limit data
function loadRateLimits(): RateLimitStore {
  if (!fs.existsSync(RATE_LIMIT_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf-8"));
  } catch {
    return {};
  }
}

// Save rate limit data
function saveRateLimits(rateLimits: RateLimitStore): void {
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(rateLimits, null, 2));
}

// Clean expired entries
function cleanExpiredEntries(rateLimits: RateLimitStore): RateLimitStore {
  const now = Date.now();
  const cleaned: RateLimitStore = {};

  for (const [key, entry] of Object.entries(rateLimits)) {
    if (entry.resetTime > now) {
      cleaned[key] = entry;
    }
  }

  return cleaned;
}

// Get client identifier (API key or IP)
function getClientId(req: Request): { id: string; isApiKey: boolean } {
  const apiKey = req.headers["x-api-key"] as string;

  if (apiKey && validateApiKey(apiKey)) {
    return { id: `key:${apiKey}`, isApiKey: true };
  }

  const ip = req.ip || req.connection.remoteAddress || "unknown";
  return { id: `ip:${ip}`, isApiKey: false };
}

// Rate limiting middleware
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id, isApiKey } = getClientId(req);

  // Determine limits based on client type
  const limit = isApiKey ? LIMITS.API_KEY_DAILY : LIMITS.ANONYMOUS_HOURLY;
  const windowMs = isApiKey ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 24h for API key, 1h for IP

  let rateLimits = loadRateLimits();
  rateLimits = cleanExpiredEntries(rateLimits);

  const now = Date.now();
  const resetTime = now + windowMs;

  if (!rateLimits[id]) {
    rateLimits[id] = { count: 0, resetTime };
  }

  const entry = rateLimits[id];

  // Reset if window expired
  if (now >= entry.resetTime) {
    entry.count = 0;
    entry.resetTime = resetTime;
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    const resetDate = new Date(entry.resetTime).toISOString();
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded",
      message: `You have exceeded the ${isApiKey ? "daily" : "hourly"} limit of ${limit} uploads. Try again after ${resetDate}`,
      rateLimit: {
        limit,
        remaining: 0,
        resetTime: resetDate,
      },
    });
  }

  // Increment counter
  entry.count += 1;
  saveRateLimits(rateLimits);

  // Add rate limit headers
  res.set({
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": (limit - entry.count).toString(),
    "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
  });

  next();
}

// Get rate limit info for a client
export function getRateLimitInfo(clientId: string, isApiKey: boolean) {
  const rateLimits = loadRateLimits();
  const entry = rateLimits[clientId];
  const limit = isApiKey ? LIMITS.API_KEY_DAILY : LIMITS.ANONYMOUS_HOURLY;

  if (!entry) {
    return {
      limit,
      remaining: limit,
      resetTime: new Date(
        Date.now() + (isApiKey ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000),
      ).toISOString(),
    };
  }

  return {
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetTime: new Date(entry.resetTime).toISOString(),
  };
}
