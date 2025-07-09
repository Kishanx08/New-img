import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from 'fs';
import subdomainSettingsRouter from './routes/subdomain-settings';
import cookieParser from 'cookie-parser';

// Load environment variables from .env file
dotenv.config();

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
  adminRouter,
} from "./routes/user-dashboard";
import {
  handleSubdomainImages,
  listSubdomainImages,
} from "./routes/subdomain-images";
import watermarkSettingsRouter from "./routes/watermark-settings";
import { requestAdminOTP, verifyAdminOTP } from "./routes/admin-auth";

// Helper to get subdomain from host
function getSubdomain(host: string) {
  // Remove port if present
  host = host.split(':')[0];
  // Remove main domain
  if (host.endsWith('x02.me')) {
    const parts = host.split('.');
    if (parts.length > 2) {
      return parts[0]; // username.x02.me
    }
  }
  return null;
}

export function getSubdomainSettings() {
  const configPath = path.join(__dirname, '../subdomain-settings.json');
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export function getSubdomainMode() {
  const modePath = path.join(__dirname, '../subdomain-mode.json');
  if (!fs.existsSync(modePath)) return 'enabled';
  const data = JSON.parse(fs.readFileSync(modePath, 'utf-8'));
  return data.mode || 'enabled';
}

export function createServer() {
  const app = express();

  // Add cookie-parser middleware
  app.use(cookieParser());

  // Server startup message
  console.log("🚀 Starting X02 Image Upload Server...");
  console.log("📅 Server started at:", new Date().toISOString());
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");
  
  // Check Discord bot configuration
  if (process.env.DISCORD_BOT_TOKEN && process.env.ADMIN_DISCORD_ID) {
    console.log("🔐 Discord bot configuration found - Admin OTP feature enabled");
  } else {
    console.log("⚠️ Discord bot configuration missing - Admin OTP feature disabled");
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware to handle subdomain image serving
  app.use((req, res, next) => {
    console.log('[Subdomain Middleware] Host:', req.headers.host, 'Path:', req.path);
    const host = req.headers.host || '';
    const subdomain = getSubdomain(host);
    if (subdomain) {
      const mode = getSubdomainMode();
      if (mode === 'disabled') {
        // Block all subdomain image requests when disabled
        return res.status(404).send('Subdomain image access is disabled');
      }
      if (mode === 'enabled') {
        // Serve images from uploads/users/<subdomain>/
        const imagePath = req.path.replace(/^\/i\//, '');
        const userImagePath = path.join(process.cwd(), 'uploads', 'users', subdomain, imagePath);
        console.log(`[Subdomain Serve] Checking for file: ${userImagePath}`);
        if (fs.existsSync(userImagePath) && fs.statSync(userImagePath).isFile()) {
          return res.sendFile(userImagePath);
        } else {
          return res.status(404).send('Image not found');
        }
      }
      // per-user mode
      const settings = getSubdomainSettings();
      if (settings[subdomain] === true) {
        const imagePath = req.path.replace(/^\/i\//, '');
        const userImagePath = path.join(process.cwd(), 'uploads', 'users', subdomain, imagePath);
        console.log(`[Subdomain Serve] Checking for file: ${userImagePath}`);
        if (fs.existsSync(userImagePath) && fs.statSync(userImagePath).isFile()) {
          return res.sendFile(userImagePath);
        } else {
          return res.status(404).send('Image not found');
        }
      } else {
        return next();
      }
    }
    next();
  });

  // Custom fallback handler for /i/:filename when subdomains are disabled
  app.get('/i/:filename', async (req, res, next) => {
    const mode = getSubdomainMode();
    if (mode !== 'disabled') return next();
    const filename = req.params.filename;
    const rootPath = path.join(process.cwd(), 'uploads', filename);
    // 1. Check root uploads directory
    if (fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
      return res.sendFile(rootPath);
    }
    // 2. Search user folders
    const usersDir = path.join(process.cwd(), 'uploads', 'users');
    if (fs.existsSync(usersDir)) {
      const users = fs.readdirSync(usersDir);
      for (const user of users) {
        const userFile = path.join(usersDir, user, filename);
        if (fs.existsSync(userFile) && fs.statSync(userFile).isFile()) {
          return res.sendFile(userFile);
        }
      }
    }
    // 3. Not found
    return res.status(404).send('Image not found');
  });

  // Serve uploaded images statically
  app.use("/i", express.static("uploads"));
  app.use("/i/users", express.static("uploads/users"));

  // Public endpoints (no API key required)
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from X02 API!" });
  });

  // Subdomain-based image serving routes
  // These routes will handle requests like kapoor.x02.me/i/photo.png
  app.get("/i/:filename", handleSubdomainImages);
  app.get("/i", listSubdomainImages);

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
  app.delete("/i/:filename", optionalApiKey, handleDeleteImage);

  // Admin authentication endpoints
  app.post("/api/admin/request-otp", requestAdminOTP);
  app.post("/api/admin/verify-otp", verifyAdminOTP);

  // Admin endpoints (protected by Discord OTP)
  app.use('/api/admin', adminRouter);

  // Subdomain settings endpoints
  app.use('/api/admin/subdomain-settings', subdomainSettingsRouter);

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
      `🌐 Subdomain images: https://{username}.x02.me/i/{filename}`,
    );
  });
}
