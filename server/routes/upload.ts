import { RequestHandler, Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { UploadResponse, ErrorResponse } from "@shared/api";

// API Key configuration
const API_KEY = "23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca";

// API Key validation middleware
const validateApiKey: RequestHandler = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key required"
    });
  }
  
  if (apiKey !== API_KEY) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key"
    });
  }
  
  next();
};

// Simple uploads directory in project root
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const SHORTLINKS_FILE = path.join(uploadsDir, 'shortlinks.json');

function loadShortLinks() {
  if (!fs.existsSync(SHORTLINKS_FILE)) return {};
  return JSON.parse(fs.readFileSync(SHORTLINKS_FILE, 'utf-8'));
}
function saveShortLinks(map) {
  fs.writeFileSync(SHORTLINKS_FILE, JSON.stringify(map, null, 2));
}
function generateShortId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
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

export { validateApiKey };

export const handleUpload: RequestHandler = (req, res) => {
  if (!req.file) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: "No image file provided",
    };
    return res.status(400).json(errorResponse);
  }

  // Generate short link
  let shortLinks = loadShortLinks();
  let shortId;
  do {
    shortId = generateShortId();
  } while (shortLinks[shortId]);
  shortLinks[shortId] = req.file.filename;
  saveShortLinks(shortLinks);

  // Use the full filename as ID (includes timestamp)
  const imageId = req.file.filename;
  const response: UploadResponse & { shortUrl: string } = {
    success: true,
    imageId,
    url: `/api/images/${req.file.filename}`,
    originalName: req.file.originalname,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
    shortUrl: `/i/${shortId}`,
  };

  res.json(response);
};

export const shortLinkRouter = Router();
shortLinkRouter.get("/:shortId", (req, res) => {
  const shortLinks = loadShortLinks();
  const filename = shortLinks[req.params.shortId];
  if (!filename) {
    return res.status(404).send("Short link not found");
  }
  res.redirect(`/api/images/${filename}`);
});
