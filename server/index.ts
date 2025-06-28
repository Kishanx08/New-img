import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { uploadMiddleware, handleUpload, shortLinkRouter, validateApiKey } from "./routes/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded images statically
  app.use("/api/images", express.static("uploads"));

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from X02 API!" });
  });

  app.get("/api/demo", handleDemo);

  // Image upload endpoint with API key validation
  app.post("/api/upload", validateApiKey, uploadMiddleware, handleUpload);

  // Short link redirect
  app.use("/i", shortLinkRouter);

  return app;
}
