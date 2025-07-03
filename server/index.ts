import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import {
  uploadMiddleware,
  handleUpload,
  handleDeleteImage,
} from "./routes/upload";
import { handleAnalytics } from "./routes/analytics";
<<<<<<< HEAD
import { validateApiKey, optionalApiKey } from "./middleware/auth";
import { rateLimitMiddleware } from "./middleware/ratelimit";
import {
  handleGenerateApiKey,
  handleGetDashboard,
  handleRegenerateApiKey,
  handleDeleteImage,
} from "./routes/apikeys";
=======
import {
  validateApiKey,
  optionalApiKey,
  trackApiKeyUsage,
} from "./middleware/api-key";
import { generateApiKey, getDashboard, regenerateApiKey } from "./routes/keys";
import { anonymousRateLimit, apiKeyRateLimit } from "./middleware/rate-limit";
import {
  registerUser,
  loginUser,
  getUserByApiKey,
  updateUserUsage,
} from "./routes/auth";
import {
  getUserDashboard,
  updateUserUsageForUpload,
  deleteUserImage,
} from "./routes/user-dashboard";
>>>>>>> origin/main

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded images statically
  app.use("/api/images", express.static("uploads"));

  // Serve user-specific images
  app.use("/api/images/users", express.static("uploads/users"));

  // Public endpoints (no API key required)
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from X02 API!" });
  });

<<<<<<< HEAD
  // API Key management endpoints
  app.post("/api/generate-key", handleGenerateApiKey);
  app.get("/api/dashboard", handleGetDashboard);
  app.post("/api/regenerate-key", handleRegenerateApiKey);
=======
  // Authentication endpoints
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.get("/api/auth/user/:apiKey", getUserByApiKey);
  app.post("/api/auth/user/:apiKey/usage", updateUserUsage);

  // User-specific dashboard and image management
  app.get("/api/user/dashboard", validateApiKey, getUserDashboard);
  app.post("/api/user/usage", validateApiKey, updateUserUsageForUpload);
  app.delete("/api/user/images/:filename", validateApiKey, deleteUserImage);

  // API Key management endpoints (deprecated but kept for backward compatibility)
  app.post("/api/keys/generate", generateApiKey);
  app.get("/api/dashboard", getDashboard);
  app.post("/api/keys/regenerate", regenerateApiKey);
>>>>>>> origin/main

  // Protected endpoints (API key required)
  app.get("/api/demo", validateApiKey, handleDemo);
  app.get("/api/analytics", validateApiKey, handleAnalytics);

<<<<<<< HEAD
  // Image management endpoints (API key required)
  app.delete("/api/images/:imageId", handleDeleteImage);

  // Image upload endpoint (API key required + rate limited)
  app.post(
    "/api/upload",
    validateApiKey,
    rateLimitMiddleware,
    uploadMiddleware,
    handleUpload,
  );
=======
  // Image upload endpoint with rate limiting (both authenticated and anonymous)
  app.post(
    "/api/upload",
    (req, res, next) => {
      // Apply different rate limits based on whether user has API key
      const hasApiKey = req.headers["x-api-key"];
      if (hasApiKey) {
        // Validate API key for registered users
        return validateApiKey(req, res, next);
      } else {
        // Anonymous users - apply rate limit only
        return anonymousRateLimit(req, res, next);
      }
    },
    (req, res, next) => {
      // Apply rate limits for registered users
      const hasApiKey = req.headers["x-api-key"];
      if (hasApiKey) {
        return apiKeyRateLimit(req, res, next);
      }
      next();
    },
    trackApiKeyUsage,
    uploadMiddleware,
    handleUpload,
  );

  // Image deletion endpoint (API key required)
  app.delete("/api/images/:filename", validateApiKey, handleDeleteImage);

  // Serve frontend static files
  app.use(express.static(path.join(__dirname, "../../dist/spa")));

  // SPA fallback: serve index.html for any unknown route (after API and static)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../dist/spa/index.html"));
  });
>>>>>>> origin/main

  return app;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

