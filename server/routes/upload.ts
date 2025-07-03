import { RequestHandler, Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import {
  UploadResponse,
  ErrorResponse,
  DeleteImageResponse,
} from "@shared/api";

// Simple uploads directory in project root
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ANALYTICS_FILE = path.join(uploadsDir, "analytics.json");

function loadAnalytics() {
  if (!fs.existsSync(ANALYTICS_FILE))
    return { uploads: 0, apiKeyUsage: 0, totalSize: 0 };
  return JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf-8"));
}

function saveAnalytics(analytics) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
}

function updateAnalytics(apiKeyUsed: boolean, fileSize: number) {
  const analytics = loadAnalytics();
  analytics.uploads += 1;
  analytics.totalSize += fileSize;
  if (apiKeyUsed) {
    analytics.apiKeyUsage += 1;
  }
  saveAnalytics(analytics);
}

// Helper function to sanitize filename
const sanitizeFilename = (filename: string) => {
  // Remove dangerous characters and spaces
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
};

// Helper function to get next available number for filename
const getNextFileNumber = (
  baseName: string,
  extension: string,
  folder: string = uploadsDir,
) => {
  let counter = 1;
  let filename = `${baseName}_${counter.toString().padStart(2, "0")}${extension}`;

  // Check if file exists, increment counter until we find available name
  while (fs.existsSync(path.join(folder, filename))) {
    counter++;
    filename = `${baseName}_${counter.toString().padStart(2, "0")}${extension}`;
  }

  return filename;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Check if user has an API key to determine folder
    const apiKey = req.headers["x-api-key"] as string;

    if (apiKey) {
      // Try to find user's folder
      const usersPath = path.join(uploadsDir, "users");

      if (fs.existsSync(usersPath)) {
        // Look for user folder by checking users.json
        const usersFile = path.join(uploadsDir, "users.json");
        if (fs.existsSync(usersFile)) {
          try {
            const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
            const user = users.find((u: any) => u.apiKey === apiKey);
            if (user) {
              // Normalize path for cross-platform compatibility
              const normalizedPath = user.uploadsFolder.replace(/\\/g, "/");
              if (fs.existsSync(normalizedPath)) {
                return cb(null, normalizedPath);
              }
            }
          } catch (error) {
            // Fall back to main uploads folder
          }
        }
      }
    }

    // Anonymous users or fallback
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    const name = path.parse(sanitized).name;
    const extension = path.extname(sanitized);

    // Get destination folder for checking existing files
    const apiKey = req.headers["x-api-key"] as string;
    let destinationFolder = uploadsDir;

    if (apiKey) {
      const usersFile = path.join(uploadsDir, "users.json");
      if (fs.existsSync(usersFile)) {
        try {
          const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
          const user = users.find((u: any) => u.apiKey === apiKey);
          if (user) {
            // Normalize path for cross-platform compatibility
            const normalizedPath = user.uploadsFolder.replace(/\\/g, "/");
            if (fs.existsSync(normalizedPath)) {
              destinationFolder = normalizedPath;
            }
          }
        } catch (error) {
          // Use default folder
        }
      }
    }

    // Get next available number: filename_01.ext, filename_02.ext, etc.
    const finalFilename = getNextFileNumber(name, extension, destinationFolder);
    cb(null, finalFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export const uploadMiddleware = upload.single("image");

export const handleUpload: RequestHandler = (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image file provided");
  }

  const apiKey = req.headers["x-api-key"] as string;

  // Generate the correct URL based on whether user has API key
  let imageUrl: string;
  if (apiKey) {
    // Check if file was uploaded to user-specific folder
    const usersFile = path.join(uploadsDir, "users.json");
    if (fs.existsSync(usersFile)) {
      try {
        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        const user = users.find((u: any) => u.apiKey === apiKey);
        if (user) {
          imageUrl = `https://x02.me/api/images/users/${user.username}/${req.file.filename}`;
        } else {
          imageUrl = `https://x02.me/api/images/${req.file.filename}`;
        }
      } catch (error) {
        imageUrl = `https://x02.me/api/images/${req.file.filename}`;
      }
    } else {
      imageUrl = `https://x02.me/api/images/${req.file.filename}`;
    }
  } else {
    imageUrl = `https://x02.me/api/images/${req.file.filename}`;
  }

  // Track the upload with API key usage
  updateAnalytics(!!apiKey, req.file.size);

  // Update user usage if user is authenticated
  if (apiKey) {
    try {
      fetch("http://localhost:8080/api/user/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          filename: req.file.filename,
          size: req.file.size,
        }),
      }).catch((err) => console.log("Usage update failed:", err));
    } catch (error) {
      console.log("Usage update error:", error);
    }
  }

  res.type("text/plain").send(imageUrl);
};

export const handleDeleteImage: RequestHandler = (req, res) => {
  try {
    const filename = req.params.filename;
    const apiKey = req.headers["x-api-key"] as string;
    let filePath = path.join(uploadsDir, filename);

    // If user has API key, check user-specific folder first
    if (apiKey) {
      const usersFile = path.join(uploadsDir, "users.json");
      if (fs.existsSync(usersFile)) {
        try {
          const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
          const user = users.find((u: any) => u.apiKey === apiKey);
          if (user) {
            // Normalize path for cross-platform compatibility
            const userFolder = user.uploadsFolder.replace(/\\/g, "/");
            const userFilePath = path.join(userFolder, filename);
            if (fs.existsSync(userFilePath)) {
              filePath = userFilePath;
            }
          }
        } catch (error) {
          // Continue with default path
        }
      }
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      const response: DeleteImageResponse = {
        success: false,
        error: "Image not found",
      };
      return res.status(404).json(response);
    }

    // Delete the file
    fs.unlinkSync(filePath);

    const response: DeleteImageResponse = {
      success: true,
      message: "Image deleted successfully",
    };

    res.json(response);
  } catch (error) {
    const response: DeleteImageResponse = {
      success: false,
      error: "Failed to delete image",
    };
    res.status(500).json(response);
  }
};
