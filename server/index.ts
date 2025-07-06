import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { handleDemo } from "./routes/demo";
import {
  uploadMiddleware,
  handleUpload,
  handleDeleteImage,
} from "./routes/upload";
import { handleAnalytics } from "./routes/analytics";
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
import {
  handleSubdomainImages,
  listSubdomainImages,
} from "./routes/subdomain-images";
import watermarkSettingsRouter from "./routes/watermark-settings";

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

  // Subdomain-based image serving routes
  // These routes will handle requests like kapoor.x02.me/api/images/photo.png
  app.get("/api/images/:filename", handleSubdomainImages);
  app.get("/api/images", listSubdomainImages);

  // Authentication endpoints
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.get("/api/auth/user/:apiKey", getUserByApiKey);
  app.post("/api/auth/user/:apiKey/usage", updateUserUsage);

  // User-specific dashboard and image management
  app.get("/api/user/dashboard", validateApiKey, getUserDashboard);
  app.post("/api/user/usage", validateApiKey, updateUserUsageForUpload);
  app.delete("/api/user/images/:filename", validateApiKey, deleteUserImage);

  // Watermark settings management
  app.use("/api/user/watermark", validateApiKey, watermarkSettingsRouter);

  // API Key management endpoints (deprecated but kept for backward compatibility)
  app.post("/api/keys/generate", generateApiKey);
  app.get("/api/dashboard", getDashboard);
  app.post("/api/keys/regenerate", regenerateApiKey);

  // Protected endpoints (API key required)
  app.get("/api/demo", validateApiKey, handleDemo);
  app.get("/api/analytics", validateApiKey, handleAnalytics);

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

  // Image deletion endpoint (API key optional for user files)
  app.delete("/api/images/:filename", optionalApiKey, handleDeleteImage);

  // Only serve static files and SPA fallback in production
  if (process.env.NODE_ENV === "production") {
    // Serve frontend static files
    app.use(express.static(path.join(__dirname, "../../dist/spa")));

    // SPA fallback: serve index.html for any unknown route (after API and static)
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../../dist/spa/index.html"));
    });
  }

  return app;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const PORT = process.env.PORT || 8080;
  // Bind to 0.0.0.0 to accept requests from all hostnames/subdomains
  const port = parseInt(process.env.PORT || "8080", 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Fusion Starter server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
    console.log(
      `🌐 Subdomain images: https://{username}.x02.me/api/images/{filename}`,
    );
  });
}
