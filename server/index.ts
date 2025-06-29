import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { uploadMiddleware, handleUpload } from "./routes/upload";
import { handleAnalytics } from "./routes/analytics";
import { validateApiKey, optionalApiKey } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded images statically
  app.use("/api/images", express.static("uploads"));

  // Public endpoints (no API key required)
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from X02 API!" });
  });

  // Protected endpoints (API key required)
  app.get("/api/demo", validateApiKey, handleDemo);
  app.get("/api/analytics", validateApiKey, handleAnalytics);

  // Image upload endpoint (API key required)
  app.post("/api/upload", validateApiKey, uploadMiddleware, handleUpload);

  return app;
}
