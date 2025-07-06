import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { User } from "@shared/auth-types";
import express from 'express';
import crypto from 'crypto';

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
        return {
          filename: file,
          url: `https://${user.username.toLowerCase()}.x02.me/api/images/${file}`,
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

// Admin: Get all users
const adminRouter = express.Router();

adminRouter.get('/users', (_req, res) => {
  try {
    const users = loadUsers();
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      apiKey: u.apiKey,
      status: 'active',
      dailyLimit: u.limits?.dailyLimit ?? 0,
      hourlyLimit: u.limits?.hourlyLimit ?? 0,
      uploads: u.usage?.count ?? 0,
      createdAt: u.createdAt,
    }));
    res.json({ success: true, users: userList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load users' });
  }
});

adminRouter.patch('/users/:id', (req, res) => {
  try {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ success: false, error: 'User not found' });
    const { username, dailyLimit, hourlyLimit, suspended } = req.body;
    if (username) users[userIndex].username = username;
    if (dailyLimit !== undefined) users[userIndex].limits.dailyLimit = dailyLimit;
    if (hourlyLimit !== undefined) users[userIndex].limits.hourlyLimit = hourlyLimit;
    if (suspended !== undefined) users[userIndex].suspended = suspended;
    saveUsers(users);
    res.json({ success: true, user: users[userIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

adminRouter.post('/users/:id/reset-api', (req, res) => {
  try {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ success: false, error: 'User not found' });
    const newApiKey = crypto.randomBytes(16).toString('hex');
    users[userIndex].apiKey = newApiKey;
    saveUsers(users);
    res.json({ success: true, apiKey: newApiKey });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reset API key' });
  }
});

adminRouter.get('/insights', (_req, res) => {
  try {
    const users = loadUsers();
    // Most active uploaders (by upload count)
    const mostActive = [...users]
      .sort((a, b) => (b.usage?.count ?? 0) - (a.usage?.count ?? 0))
      .slice(0, 5)
      .map(u => ({ username: u.username, uploads: u.usage?.count ?? 0 }));

    // Biggest files (scan all user folders)
    let biggestFiles: { username: string; filename: string; size: number }[] = [];
    users.forEach(u => {
      const userFolder = u.uploadsFolder.replace(/\\/g, '/');
      if (fs.existsSync(userFolder)) {
        const files = fs.readdirSync(userFolder);
        files.forEach(file => {
          const ext = path.extname(file).toLowerCase();
          if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext)) {
            const stats = fs.statSync(path.join(userFolder, file));
            biggestFiles.push({ username: u.username, filename: file, size: stats.size });
          }
        });
      }
    });
    biggestFiles = biggestFiles.sort((a, b) => b.size - a.size).slice(0, 5);

    // Mock: users with most rate limit hits
    const mostRateLimited = users.slice(0, 3).map(u => ({ username: u.username, hits: Math.floor(Math.random() * 10) }));
    // Mock: watermark usage
    const watermarkUsage = users.map(u => ({ username: u.username, used: Math.random() > 0.5 }));
    // Mock: shortlink creation
    const shortlinkCounts = users.map(u => ({ username: u.username, count: Math.floor(Math.random() * 5) }));

    res.json({
      success: true,
      mostActive,
      biggestFiles,
      mostRateLimited,
      watermarkUsage,
      shortlinkCounts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load insights' });
  }
});

adminRouter.get('/alerts', (_req, res) => {
  try {
    // Mock alerts
    const now = Date.now();
    const alerts = [
      {
        id: '1',
        type: 'upload',
        message: 'Large file uploaded: bigfile.png (52MB)',
        timestamp: new Date(now - 1000 * 60 * 2).toISOString(),
        severity: 'warning',
        user: 'kishan',
      },
      {
        id: '2',
        type: 'rate-limit',
        message: 'User hit rate limit: spammer',
        timestamp: new Date(now - 1000 * 60 * 5).toISOString(),
        severity: 'error',
        user: 'spammer',
      },
      {
        id: '3',
        type: 'system',
        message: 'CPU usage spiked above 80%',
        timestamp: new Date(now - 1000 * 60 * 10).toISOString(),
        severity: 'warning',
      },
      {
        id: '4',
        type: 'user',
        message: 'New user registered: testuser',
        timestamp: new Date(now - 1000 * 60 * 20).toISOString(),
        severity: 'success',
        user: 'testuser',
      },
      {
        id: '5',
        type: 'error',
        message: 'System error: Watermarking failed',
        timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
        severity: 'error',
      },
    ];
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load alerts' });
  }
});

adminRouter.get('/analytics', (_req, res) => {
  try {
    // Mock analytics data
    const analytics = {
      uploadVolume: [
        { date: '2024-07-01', count: 20 },
        { date: '2024-07-02', count: 35 },
        { date: '2024-07-03', count: 28 },
        { date: '2024-07-04', count: 40 },
        { date: '2024-07-05', count: 32 },
      ],
      fileTypeDistribution: [
        { type: 'jpg', count: 50 },
        { type: 'png', count: 30 },
        { type: 'gif', count: 10 },
        { type: 'webp', count: 5 },
        { type: 'bmp', count: 2 },
      ],
      userActivity: [
        { username: 'kishan', count: 120 },
        { username: 'testuser', count: 30 },
        { username: 'root', count: 10 },
      ],
      storageTrends: [
        { date: '2024-07-01', size: 200 },
        { date: '2024-07-02', size: 250 },
        { date: '2024-07-03', size: 300 },
        { date: '2024-07-04', size: 350 },
        { date: '2024-07-05', size: 400 },
      ],
    };
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load analytics' });
  }
});

adminRouter.get('/performance', (_req, res) => {
  try {
    // Mock performance data
    const performance = {
      uploadSpeed: [
        { date: '2024-07-01', speed: 2.1 },
        { date: '2024-07-02', speed: 2.5 },
        { date: '2024-07-03', speed: 2.3 },
        { date: '2024-07-04', speed: 2.8 },
        { date: '2024-07-05', speed: 2.6 },
      ],
      watermarkProcessing: [
        { date: '2024-07-01', ms: 120 },
        { date: '2024-07-02', ms: 110 },
        { date: '2024-07-03', ms: 130 },
        { date: '2024-07-04', ms: 125 },
        { date: '2024-07-05', ms: 115 },
      ],
      errorRates: [
        { date: '2024-07-01', rate: 0.01 },
        { date: '2024-07-02', rate: 0.02 },
        { date: '2024-07-03', rate: 0.00 },
        { date: '2024-07-04', rate: 0.03 },
        { date: '2024-07-05', rate: 0.01 },
      ],
      apiResponseTimes: [
        { date: '2024-07-01', ms: 180 },
        { date: '2024-07-02', ms: 170 },
        { date: '2024-07-03', ms: 160 },
        { date: '2024-07-04', ms: 175 },
        { date: '2024-07-05', ms: 165 },
      ],
      bandwidthUsage: [
        { date: '2024-07-01', mb: 120 },
        { date: '2024-07-02', mb: 140 },
        { date: '2024-07-03', mb: 130 },
        { date: '2024-07-04', mb: 150 },
        { date: '2024-07-05', mb: 160 },
      ],
    };
    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load performance data' });
  }
});

export { adminRouter };
