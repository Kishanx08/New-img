import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { RateLimit } from "@shared/types";

const RATE_LIMIT_FILE = path.join("uploads", "rate-limits.json");

function loadRateLimits(): RateLimit {
  if (!fs.existsSync(RATE_LIMIT_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveRateLimits(limits: RateLimit) {
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(limits, null, 2));
}

function getClientIp(req: Request): string {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

function cleanupExpiredLimits(limits: RateLimit): RateLimit {
  const now = Date.now();
  const cleaned: RateLimit = {};

  for (const [key, value] of Object.entries(limits)) {
    if (value.resetTime > now) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export const rateLimitMiddleware = (options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const limits = cleanupExpiredLimits(loadRateLimits());
      const now = Date.now();

      // Determine the key for rate limiting
      let key: string;
      const apiKey = req.headers["x-api-key"] as string;

      if (apiKey && options.keyGenerator) {
        key = options.keyGenerator(req);
      } else if (apiKey) {
        key = `api:${apiKey}`;
      } else {
        key = `ip:${getClientIp(req)}`;
      }

      // Check current usage
      const currentLimit = limits[key];

      if (!currentLimit) {
        // First request from this key/IP
        limits[key] = {
          count: 1,
          resetTime: now + options.windowMs,
        };
      } else if (currentLimit.resetTime <= now) {
        // Window expired, reset
        limits[key] = {
          count: 1,
          resetTime: now + options.windowMs,
        };
      } else if (currentLimit.count >= options.maxRequests) {
        // Rate limit exceeded
        const timeLeft = Math.ceil((currentLimit.resetTime - now) / 1000);

        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded",
          message: `Too many requests. Try again in ${timeLeft} seconds.`,
          retryAfter: timeLeft,
        });
      } else {
        // Increment count
        limits[key].count++;
      }

      saveRateLimits(limits);

      // Add rate limit headers
      res.setHeader("X-RateLimit-Limit", options.maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, options.maxRequests - limits[key].count),
      );
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(limits[key].resetTime).toISOString(),
      );

      next();
    } catch (error) {
      // If rate limiting fails, allow the request but log error
      console.error("Rate limiting error:", error);
      next();
    }
  };
};

// Preset rate limiters
export const anonymousRateLimit = rateLimitMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
});

export const apiKeyRateLimit = rateLimitMiddleware({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 50,
  keyGenerator: (req) => `api:${req.headers["x-api-key"]}`,
});
