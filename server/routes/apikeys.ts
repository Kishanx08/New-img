import { RequestHandler } from "express";
import {
  generateApiKey,
  validateApiKey,
  getApiKeyStats,
  regenerateApiKey,
  getUserImages,
  deleteImage,
} from "../lib/apikeys";
import { getRateLimitInfo } from "../middleware/ratelimit";
import {
  ApiKeyResponse,
  DashboardResponse,
  DeleteImageResponse,
} from "@shared/api";

// Generate new API key
export const handleGenerateApiKey: RequestHandler = (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const apiKey = generateApiKey(ip);

    const response: ApiKeyResponse = {
      success: true,
      apiKey,
      message: "API key generated successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to generate API key",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get dashboard data for API key
export const handleGetDashboard: RequestHandler = (req, res) => {
  try {
    const apiKey = req.query.key as string;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "API key required",
        message: "Please provide an API key via query parameter 'key'",
      });
    }

    const apiKeyData = validateApiKey(apiKey);

    if (!apiKeyData) {
      return res.status(403).json({
        success: false,
        error: "Invalid API key",
        message: "The provided API key is invalid or inactive",
      });
    }

    // Get rate limit info
    const rateLimitInfo = getRateLimitInfo(`key:${apiKey}`, true);

    // Get user images
    const images = getUserImages(apiKey);

    // Calculate total size
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);

    const response: DashboardResponse = {
      success: true,
      stats: {
        apiKey,
        uploadsCount: apiKeyData.uploads,
        dailyLimit: rateLimitInfo.limit,
        remainingUploads: rateLimitInfo.remaining,
        totalSize,
        lastUsed: apiKeyData.lastUsed,
        createdAt: apiKeyData.createdAt,
      },
      images: images.slice(0, 50), // Limit to last 50 images
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get dashboard data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Regenerate API key
export const handleRegenerateApiKey: RequestHandler = (req, res) => {
  try {
    const { oldKey } = req.body;

    if (!oldKey) {
      return res.status(400).json({
        success: false,
        error: "Old API key required",
        message: "Please provide the old API key to regenerate",
      });
    }

    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const newKey = regenerateApiKey(oldKey, ip);

    if (!newKey) {
      return res.status(403).json({
        success: false,
        error: "Invalid API key",
        message: "The provided API key is invalid",
      });
    }

    const response: ApiKeyResponse = {
      success: true,
      apiKey: newKey,
      message: "API key regenerated successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to regenerate API key",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete image
export const handleDeleteImage: RequestHandler = (req, res) => {
  try {
    const { imageId } = req.params;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "API key required",
        message: "Please provide an API key via x-api-key header",
      });
    }

    if (!validateApiKey(apiKey)) {
      return res.status(403).json({
        success: false,
        error: "Invalid API key",
        message: "The provided API key is invalid or inactive",
      });
    }

    const deleted = deleteImage(imageId, apiKey);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Image not found",
        message: "Image not found or you don't have permission to delete it",
      });
    }

    const response: DeleteImageResponse = {
      success: true,
      message: "Image deleted successfully",
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete image",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
