import fs from "fs";
import path from "path";
import express from 'express';
import crypto from 'crypto';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_FILE = path.join("uploads", "users.json");
function loadUsers() {
    if (!fs.existsSync(USERS_FILE))
        return [];
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
    catch {
        return [];
    }
}
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function getUserUploads(user) {
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
                url: `https://${user.username.toLowerCase()}.x02.me/i/${file}`,
                timestamp: stats.birthtime.toISOString(),
                size: stats.size,
            };
        })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    catch (error) {
        console.error("Error reading user uploads:", error);
        return [];
    }
}
export const getUserDashboard = (req, res) => {
    try {
        const users = loadUsers();
        const apiKey = req.headers["x-api-key"];
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
        const todayUploads = uploads.filter((upload) => new Date(upload.timestamp).toDateString() === today);
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
    }
    catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to load dashboard",
        });
    }
};
export const updateUserUsageForUpload = (req, res) => {
    try {
        const users = loadUsers();
        const apiKey = req.headers["x-api-key"];
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
    }
    catch (error) {
        console.error("Usage update error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update usage",
        });
    }
};
export const deleteUserImage = (req, res) => {
    try {
        const users = loadUsers();
        const apiKey = req.headers["x-api-key"];
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to load users' });
    }
});
adminRouter.get('/users/:id', (req, res) => {
    try {
        const usersPath = path.join(__dirname, '../../uploads/users.json');
        if (!fs.existsSync(usersPath))
            return res.status(404).json({ success: false, error: 'User DB not found' });
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const user = users.find((u) => u.id === req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get user' });
    }
});
adminRouter.patch('/users/:id', (req, res) => {
    try {
        const usersPath = path.join(__dirname, '../../uploads/users.json');
        if (!fs.existsSync(usersPath))
            return res.status(404).json({ success: false, error: 'User DB not found' });
        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const idx = users.findIndex((u) => u.id === req.params.id);
        if (idx === -1)
            return res.status(404).json({ success: false, error: 'User not found' });
        const user = users[idx];
        const { username, dailyLimit, hourlyLimit, status } = req.body;
        if (username)
            user.username = username;
        if (dailyLimit)
            user.limits.dailyLimit = dailyLimit;
        if (hourlyLimit)
            user.limits.hourlyLimit = hourlyLimit;
        if (status)
            user.status = status;
        users[idx] = user;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
});
adminRouter.patch('/users/:id/status', (req, res) => {
    try {
        const usersPath = path.join(__dirname, '../../uploads/users.json');
        if (!fs.existsSync(usersPath))
            return res.status(404).json({ success: false, error: 'User DB not found' });
        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const idx = users.findIndex((u) => u.id === req.params.id);
        if (idx === -1)
            return res.status(404).json({ success: false, error: 'User not found' });
        const { status } = req.body;
        if (!['active', 'suspended'].includes(status))
            return res.status(400).json({ success: false, error: 'Invalid status' });
        users[idx].status = status;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        res.json({ success: true, user: users[idx] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update user status' });
    }
});
adminRouter.post('/users/:id/reset-api', (req, res) => {
    try {
        const usersPath = path.join(__dirname, '../../uploads/users.json');
        if (!fs.existsSync(usersPath))
            return res.status(404).json({ success: false, error: 'User DB not found' });
        let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const idx = users.findIndex((u) => u.id === req.params.id);
        if (idx === -1)
            return res.status(404).json({ success: false, error: 'User not found' });
        const newApiKey = crypto.randomBytes(16).toString('hex');
        users[idx].apiKey = newApiKey;
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
        res.json({ success: true, apiKey: newApiKey });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reset API key' });
    }
});
adminRouter.delete('/users/:id', (req, res) => {
    try {
        const userId = req.params.id;
        let users = loadUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const user = users[userIndex];
        // Remove user from users.json
        users.splice(userIndex, 1);
        saveUsers(users);
        // Delete user's uploads folder
        if (user.uploadsFolder && fs.existsSync(user.uploadsFolder)) {
            fs.rmSync(user.uploadsFolder, { recursive: true, force: true });
        }
        // Optionally, clean up subdomain-settings.json
        const subdomainSettingsPath = path.join(process.cwd(), 'subdomain-settings.json');
        if (fs.existsSync(subdomainSettingsPath)) {
            try {
                const subdomainSettings = JSON.parse(fs.readFileSync(subdomainSettingsPath, 'utf-8'));
                if (subdomainSettings[user.id]) {
                    delete subdomainSettings[user.id];
                    fs.writeFileSync(subdomainSettingsPath, JSON.stringify(subdomainSettings, null, 2));
                }
            }
            catch { }
        }
        // Optionally, clean up analytics, etc. (not implemented here)
        res.json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user' });
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
        let biggestFiles = [];
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to load insights' });
    }
});
adminRouter.get('/alerts', (_req, res) => {
    try {
        const alerts = [];
        const rateLimitsPath = path.join(__dirname, '../../uploads/rate-limits.json');
        const analyticsPath = path.join(__dirname, '../../uploads/analytics.json');
        // Rate limit hits
        if (fs.existsSync(rateLimitsPath)) {
            const rateLimits = JSON.parse(fs.readFileSync(rateLimitsPath, 'utf8'));
            for (const key in rateLimits) {
                const rl = rateLimits[key];
                if (rl.hits && rl.hits > 0) {
                    alerts.push({
                        type: 'rate-limit',
                        message: `Rate limit hit: ${rl.hits} times`,
                        user: rl.username || rl.user || key,
                        timestamp: rl.lastHit || new Date().toISOString(),
                        severity: rl.hits > 10 ? 'warning' : 'info',
                    });
                }
            }
        }
        // Large uploads/errors from analytics
        if (fs.existsSync(analyticsPath)) {
            const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
            if (Array.isArray(analytics.alerts)) {
                for (const a of analytics.alerts) {
                    alerts.push(a);
                }
            }
        }
        alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        res.json({ success: true, alerts });
    }
    catch (error) {
        console.error('Alerts endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to load alerts' });
    }
});
adminRouter.get('/analytics', (_req, res) => {
    try {
        const analyticsPath = path.join(__dirname, '../../uploads/analytics.json');
        let analytics = {
            uploadVolume: [],
            fileTypeDistribution: [],
            userActivity: [],
            storageTrends: [],
        };
        if (fs.existsSync(analyticsPath)) {
            const data = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
            analytics = {
                uploadVolume: data.uploadVolume || [],
                fileTypeDistribution: data.fileTypeDistribution || [],
                userActivity: data.userActivity || [],
                storageTrends: data.storageTrends || [],
            };
        }
        res.json({ success: true, analytics });
    }
    catch (error) {
        console.error('Analytics endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to load analytics' });
    }
});
adminRouter.get('/performance', (_req, res) => {
    try {
        const usageStatsPath = path.join(__dirname, '../../uploads/usage-stats.json');
        let performance = {
            uploadSpeed: [],
            watermarkProcessing: [],
            errorRates: [],
            apiResponseTimes: [],
            bandwidthUsage: [],
        };
        if (fs.existsSync(usageStatsPath)) {
            const data = JSON.parse(fs.readFileSync(usageStatsPath, 'utf8'));
            performance = {
                uploadSpeed: data.uploadSpeed || [],
                watermarkProcessing: data.watermarkProcessing || [],
                errorRates: data.errorRates || [],
                apiResponseTimes: data.apiResponseTimes || [],
                bandwidthUsage: data.bandwidthUsage || [],
            };
        }
        res.json({ success: true, performance });
    }
    catch (error) {
        console.error('Performance endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to load performance data' });
    }
});
adminRouter.get('/overview', (_req, res) => {
    try {
        const usersPath = path.join(__dirname, '../../uploads/users.json');
        const usersDir = path.join(__dirname, '../../uploads/users');
        let users = [];
        if (fs.existsSync(usersPath)) {
            users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        }
        let uploadCount = 0;
        let storageUsed = 0;
        let todaysUploads = 0;
        const today = new Date().toISOString().slice(0, 10);
        if (fs.existsSync(usersDir)) {
            const userDirs = fs.readdirSync(usersDir);
            for (const user of userDirs) {
                const userPath = path.join(usersDir, user);
                if (fs.statSync(userPath).isDirectory()) {
                    const files = fs.readdirSync(userPath);
                    for (const file of files) {
                        const filePath = path.join(userPath, file);
                        const stat = fs.statSync(filePath);
                        uploadCount++;
                        storageUsed += stat.size;
                        const mtime = stat.mtime.toISOString().slice(0, 10);
                        if (mtime === today) {
                            todaysUploads++;
                        }
                    }
                }
            }
        }
        // System Health
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memory = (usedMem / totalMem) * 100;
        const uptimeSec = os.uptime();
        const uptimeH = Math.floor(uptimeSec / 3600);
        const uptimeM = Math.floor((uptimeSec % 3600) / 60);
        const uptime = `${uptimeH}h ${uptimeM}m`;
        // CPU usage (average over 1, 5, 15 min)
        const load = os.loadavg();
        const cpu = Math.min(100, (load[0] / os.cpus().length) * 100);
        // Disk and network are not available natively in Node.js, so use mock values
        const systemHealth = {
            cpu,
            memory,
            disk: 10 + Math.random() * 60, // mock disk usage %
            activeConnections: Math.floor(Math.random() * 50),
            uptime,
        };
        // Activity Feed
        const activityLogPath = path.join(__dirname, '../../uploads/activity-log.json');
        let activityFeed = [];
        if (fs.existsSync(activityLogPath)) {
            activityFeed = JSON.parse(fs.readFileSync(activityLogPath, 'utf8'));
            activityFeed = Array.isArray(activityFeed) ? activityFeed.slice(-20).reverse() : [];
        }
        res.json({
            success: true,
            overview: {
                userCount: users.length,
                uploadCount,
                storageUsed,
                todaysUploads,
                systemHealth,
                activityFeed,
            },
        });
    }
    catch (error) {
        console.error('Overview endpoint error:', error);
        res.status(500).json({ success: false, error: 'Failed to load overview' });
    }
});
export { adminRouter };
