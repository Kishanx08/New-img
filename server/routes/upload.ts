import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { UploadResponse, ErrorResponse } from "@shared/api";

// Simple uploads directory in project root
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
const getNextFileNumber = (baseName: string, extension: string) => {
  let counter = 1;
  let filename = `${baseName}_${counter.toString().padStart(2, "0")}${extension}`;

  // Check if file exists, increment counter until we find available name
  while (fs.existsSync(path.join(uploadsDir, filename))) {
    counter++;
    filename = `${baseName}_${counter.toString().padStart(2, "0")}${extension}`;
  }

  return filename;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    const name = path.parse(sanitized).name;
    const extension = path.extname(sanitized);

    // Get next available number: filename_01.ext, filename_02.ext, etc.
    const finalFilename = getNextFileNumber(name, extension);
    cb(null, finalFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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
    const errorResponse: ErrorResponse = {
      success: false,
      error: "No image file provided",
    };
    return res.status(400).json(errorResponse);
  }

  // Use the full filename as ID (includes timestamp)
  const imageId = req.file.filename;
  const response: UploadResponse = {
    success: true,
    imageId,
    url: `/api/images/${req.file.filename}`,
    originalName: req.file.originalname,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  };

  res.json(response);
};
