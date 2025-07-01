import { Request, Response, NextFunction } from "express";
import {
  validateApiKey as validateUserApiKey,
  updateApiKeyUsage,
} from "../lib/apikeys";

// Hard-coded API key for backward compatibility
const HARDCODED_API_KEY =
  "ef4c5a28f912a27e40c332fab67b0e3246380ec1d97eae45053d5a2d2c4c597d";

// API key validation middleware
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Get API key from different sources
  const apiKeyFromHeader =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");
  const apiKeyFromQuery = req.query.apiKey as string;
  const apiKeyFromBody = req.body?.apiKey;

  // Use the first available API key
  const apiKey = apiKeyFromHeader || apiKeyFromQuery || apiKeyFromBody;

  // If API key is required but not provided
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key is required",
      message:
        "Please provide an API key via header 'x-api-key', 'authorization' header, query parameter 'apiKey', or in request body",
    });
  }

  // Check if it's the hardcoded key (for backward compatibility)
  if (apiKey === HARDCODED_API_KEY) {
    return next();
  }

  // Validate user API key
  const userApiKeyData = validateUserApiKey(apiKey);
  if (!userApiKeyData) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key",
      message: "The provided API key is invalid or inactive",
    });
  }

  // Store API key data in request for later use
  (req as any).apiKeyData = userApiKeyData;

  // API key is valid, proceed
  next();
};

// Optional API key validation (for endpoints that work with or without API key)
export const optionalApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKeyFromHeader =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");
  const apiKeyFromQuery = req.query.apiKey as string;
  const apiKeyFromBody = req.body?.apiKey;

  const apiKey = apiKeyFromHeader || apiKeyFromQuery || apiKeyFromBody;

  // If no API key is provided, allow access
  if (!apiKey) {
    return next();
  }

  // Check hardcoded key first
  if (apiKey === HARDCODED_API_KEY) {
    return next();
  }

  // Check user API key
  const userApiKeyData = validateUserApiKey(apiKey);
  if (!userApiKeyData) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key",
      message: "The provided API key is invalid or inactive",
    });
  }

  // Store API key data in request for later use
  (req as any).apiKeyData = userApiKeyData;

  // API key is valid, proceed
  next();
};
