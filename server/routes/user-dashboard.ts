import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { User } from "@shared/auth-types";
import { createShortlink } from "./shortlinks";

const USERS_FILE = path.join("uploads", "users.json");

function loadUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getUserUploads(user: User) {
  // Normalize path for cross-platform compatibility
  const userFolder = user.uploadsFolder.replace(/\\/g, "/");
  if (!fs.existsSync(userFolder)) {
    return [];
  }

  try {
    const files = fs.readdirSync(userFolder);
    return files
      .filter((file) => {
        // Only include image files
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext);
      })
      .map((file) => {
        const filePath = path.join(userFolder, file);
        const stats = fs.statSync(filePath);
        // Generate or get existing short URL
        const shortCode = createShortlink(file);
        return {
          filename: file,
          url: `/api/images/users/${user.username}/${file}`,
          shortUrl: `https://x02.me/s/${shortCode}`,
          timestamp: stats.birthtime.toISOString(),
          size: stats.size,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  } catch (error) {
    console.error("Error reading user uploads:", error);
    return [];
  }
}

export const getUserDashboard: RequestHandler = (req, res) => {
  try {
    const users = loadUsers();
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "API key required",
      });
    }

    const user = users.find((u) => u.apiKey === apiKey);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get user's uploads
    const uploads = getUserUploads(user);

    // Calculate usage for today
    const today = new Date().toDateString();
    const todayUploads = uploads.filter(
      (upload) => new Date(upload.timestamp).toDateString() === today,
    );

    const response = {
      success: true,
      data: {
        user: {
          username: user.username,
          apiKey: user.apiKey,
          createdAt: user.createdAt,
          limits: user.limits,
          usage: {
            ...user.usage,
            todayCount: todayUploads.length,
            remaining: user.limits.dailyLimit - todayUploads.length,
          },
        },
        uploads,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load dashboard",
    });
  }
};

export const updateUserUsageForUpload: RequestHandler = (req, res) => {
  try {
    const users = loadUsers();
    const apiKey = req.headers["x-api-key"] as string;
    const { filename, size } = req.body;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "API key required",
      });
    }

    const userIndex = users.findIndex((u) => u.apiKey === apiKey);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update user usage
    users[userIndex].usage.count++;
    users[userIndex].usage.lastUsed = new Date().toISOString();

    saveUsers(users);

    res.json({
      success: true,
      message: "Usage updated successfully",
    });
  } catch (error) {
    console.error("Usage update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update usage",
    });
  }
};

export const deleteUserImage: RequestHandler = (req, res) => {
  try {
    const users = loadUsers();
    const apiKey = req.headers["x-api-key"] as string;
    const filename = req.params.filename;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "API key required",
      });
    }

    const user = users.find((u) => u.apiKey === apiKey);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const filePath = path.join(user.uploadsFolder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Image not found",
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete image",
    });
  }
};