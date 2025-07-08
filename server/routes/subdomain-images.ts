import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import {
  getSubdomain,
  isValidUserSubdomain,
  getActualUserFolder,
  sanitizeFilename,
} from "../utils/getSubdomain";

/**
 * Handles subdomain-based image serving
 * Route: GET /api/i/:filename
 *
 * Examples:
 * - https://kapoor.x02.me/api/i/photo.png
 * - https://kishan.x02.me/api/i/screenshot.jpg
 */
export const handleSubdomainImages: RequestHandler = (req, res) => {
  try {
    // Extract subdomain from hostname
    const hostname = req.hostname || req.get("host") || "";
    const subdomain = getSubdomain(hostname);

    console.log(
      `[Subdomain Images] Request from ${hostname}, extracted subdomain: ${subdomain}`,
    );

    // Check if we have a valid subdomain
    if (!subdomain) {
      console.log(
        `[Subdomain Images] No valid subdomain found for hostname: ${hostname}`,
      );
      return res.status(400).json({
        success: false,
        error: "Invalid subdomain",
        message: "Please use a valid subdomain like username.x02.me",
        hostname: hostname,
      });
    }

    // Validate that this subdomain corresponds to an existing user
    if (!isValidUserSubdomain(subdomain)) {
      console.log(
        `[Subdomain Images] User folder not found for subdomain: ${subdomain}`,
      );
      return res.status(404).json({
        success: false,
        error: "User not found",
        message: `No user folder found for subdomain '${subdomain}'`,
        subdomain: subdomain,
      });
    }

    // Get the actual case-sensitive folder name
    const actualFolder = getActualUserFolder(subdomain);
    if (!actualFolder) {
      console.log(
        `[Subdomain Images] Could not determine actual folder for subdomain: ${subdomain}`,
      );
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Could not determine user folder",
      });
    }

    // Get and sanitize filename
    const rawFilename = req.params.filename;
    const filename = sanitizeFilename(rawFilename);

    if (!filename) {
      console.log(`[Subdomain Images] Invalid filename: ${rawFilename}`);
      return res.status(400).json({
        success: false,
        error: "Invalid filename",
        message: "Filename contains invalid characters",
        filename: rawFilename,
      });
    }

    // Construct file path using the actual folder name
    const filePath = path.join("uploads", "users", actualFolder, filename);
    const absoluteFilePath = path.resolve(filePath);

    console.log(`[Subdomain Images] Looking for file: ${absoluteFilePath}`);

    // Security check: ensure the resolved path is within the expected directory
    const expectedBasePath = path.resolve("uploads", "users", actualFolder);
    if (!absoluteFilePath.startsWith(expectedBasePath)) {
      console.log(
        `[Subdomain Images] Path traversal attempt detected: ${absoluteFilePath}`,
      );
      return res.status(400).json({
        success: false,
        error: "Invalid file path",
        message: "File path contains invalid characters",
      });
    }

    // Check if file exists
    if (!fs.existsSync(absoluteFilePath)) {
      console.log(`[Subdomain Images] File not found: ${absoluteFilePath}`);
      return res.status(404).json({
        success: false,
        error: "File not found",
        message: `Image '${filename}' not found for user '${subdomain}'`,
        path: filePath,
      });
    }

    // Get file stats for additional validation
    const stats = fs.statSync(absoluteFilePath);
    if (!stats.isFile()) {
      console.log(`[Subdomain Images] Path is not a file: ${absoluteFilePath}`);
      return res.status(400).json({
        success: false,
        error: "Invalid file",
        message: "The requested path is not a file",
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";

    // Set headers for caching and content type
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day cache
    res.setHeader("X-Served-By", "X02-Subdomain-Service");
    res.setHeader("X-User", subdomain);

    console.log(
      `[Subdomain Images] Serving file: ${absoluteFilePath} (${stats.size} bytes)`,
    );

    // Serve the file
    res.sendFile(absoluteFilePath, (err) => {
      if (err) {
        console.error(`[Subdomain Images] Error serving file: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: "Failed to serve file",
            message: "An error occurred while serving the image",
          });
        }
      } else {
        console.log(
          `[Subdomain Images] Successfully served: ${filename} to ${subdomain}.x02.me`,
        );
      }
    });
  } catch (error) {
    console.error("[Subdomain Images] Unexpected error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
};

/**
 * Lists all images for a subdomain user
 * Route: GET /api/i (when accessed via subdomain)
 */
export const listSubdomainImages: RequestHandler = (req, res) => {
  try {
    const hostname = req.hostname || req.get("host") || "";
    const subdomain = getSubdomain(hostname);

    if (!subdomain || !isValidUserSubdomain(subdomain)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subdomain",
        message: "Please use a valid user subdomain",
      });
    }

    // Get the actual case-sensitive folder name
    const actualFolder = getActualUserFolder(subdomain);
    if (!actualFolder) {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Could not determine user folder",
      });
    }

    const userDir = path.join("uploads", "users", actualFolder);
    const files = fs.readdirSync(userDir);

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".bmp",
      ".svg",
    ];
    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map((file) => {
        const filePath = path.join(userDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `https://${subdomain}.x02.me/api/i/${file}`,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      });

    res.json({
      success: true,
      data: {
        user: subdomain,
        images,
        total: images.length,
      },
    });
  } catch (error) {
    console.error("[Subdomain Images] Error listing images:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list images",
    });
  }
};
