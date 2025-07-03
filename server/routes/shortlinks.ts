import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const SHORTLINKS_FILE = path.join("uploads", "shortlinks.json");

interface ShortlinkData {
  [key: string]: string; // shortCode -> filename
}

function loadShortlinks(): ShortlinkData {
  if (!fs.existsSync(SHORTLINKS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(SHORTLINKS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveShortlinks(data: ShortlinkData) {
  fs.writeFileSync(SHORTLINKS_FILE, JSON.stringify(data, null, 2));
}

function generateShortCode(): string {
  // Generate a 6-character URL-safe short code
  return crypto.randomBytes(4).toString("base64url").substring(0, 6);
}

export function createShortlink(filename: string): string {
  const shortlinks = loadShortlinks();

  // Check if filename already has a shortlink
  for (const [code, existingFilename] of Object.entries(shortlinks)) {
    if (existingFilename === filename) {
      return code;
    }
  }

  // Generate new shortcode
  let shortCode: string;
  do {
    shortCode = generateShortCode();
  } while (shortlinks[shortCode]); // Ensure uniqueness

  // Save the mapping
  shortlinks[shortCode] = filename;
  saveShortlinks(shortlinks);

  return shortCode;
}

export const handleShortlinkRedirect: RequestHandler = (req, res) => {
  try {
    const shortCode = req.params.code;
    const shortlinks = loadShortlinks();

    const filename = shortlinks[shortCode];
    if (!filename) {
      return res.status(404).json({
        success: false,
        error: "Short link not found",
      });
    }

    // Try to find the file in user directories first, then main uploads
    const usersDir = path.join("uploads", "users");
    let fileFound = false;
    let redirectUrl = "";

    if (fs.existsSync(usersDir)) {
      const userFolders = fs.readdirSync(usersDir);
      for (const userFolder of userFolders) {
        const userPath = path.join(usersDir, userFolder);
        const filePath = path.join(userPath, filename);
        if (fs.existsSync(filePath)) {
          redirectUrl = `/api/images/users/${userFolder}/${filename}`;
          fileFound = true;
          break;
        }
      }
    }

    // If not found in user directories, check main uploads
    if (!fileFound) {
      const mainFilePath = path.join("uploads", filename);
      if (fs.existsSync(mainFilePath)) {
        redirectUrl = `/api/images/${filename}`;
        fileFound = true;
      }
    }

    if (!fileFound) {
      return res.status(404).json({
        success: false,
        error: "Image file not found",
      });
    }

    // Redirect to the actual image URL
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Shortlink redirect error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process shortlink",
    });
  }
};

export const getShortlinkInfo: RequestHandler = (req, res) => {
  try {
    const shortCode = req.params.code;
    const shortlinks = loadShortlinks();

    const filename = shortlinks[shortCode];
    if (!filename) {
      return res.status(404).json({
        success: false,
        error: "Short link not found",
      });
    }

    res.json({
      success: true,
      data: {
        shortCode,
        filename,
        shortUrl: `https://x02.me/s/${shortCode}`,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get shortlink info",
    });
  }
};
