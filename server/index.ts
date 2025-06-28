import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { handleDemo } from "./routes/demo";
import { uploadMiddleware, handleUpload } from "./routes/upload";

export function createServer() {
  const app = express();

  // Get current directory for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded images statically
  app.use("/api/images", express.static(path.join(__dirname, "../uploads")));

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from KishanX02 API!" });
  });

  app.get("/api/demo", handleDemo);

  // Image upload endpoint
  app.post("/api/upload", uploadMiddleware, handleUpload);

  return app;
}
