import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { uploadMiddleware, handleUpload } from "./routes/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded images statically
  app.use("/api/images", express.static(path.join(process.cwd(), "uploads")));

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from PixelHost API!" });
  });

  app.get("/api/demo", handleDemo);

  // Image upload endpoint
  app.post("/api/upload", uploadMiddleware, handleUpload);

  return app;
}
