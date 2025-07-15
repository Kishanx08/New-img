import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
function randomString(length) {
    // Exclude ambiguous chars: O/0, I/1, L
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
import { WatermarkService } from "../utils/watermark";
import { canUseSubdomain } from '../index';
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
function updateAnalytics(apiKeyUsed, fileSize) {
    const analytics = loadAnalytics();
    analytics.uploads += 1;
    analytics.totalSize += fileSize;
    if (apiKeyUsed) {
        analytics.apiKeyUsage += 1;
    }
    saveAnalytics(analytics);
}
const USAGE_STATS_FILE = path.join(uploadsDir, "usage-stats.json");
function loadUsageStats() {
    if (!fs.existsSync(USAGE_STATS_FILE))
        return {
            uploadSpeed: [],
            watermarkProcessing: [],
            errorRates: [],
            apiResponseTimes: [],
            bandwidthUsage: []
        };
    return JSON.parse(fs.readFileSync(USAGE_STATS_FILE, "utf-8"));
}
function saveUsageStats(stats) {
    fs.writeFileSync(USAGE_STATS_FILE, JSON.stringify(stats, null, 2));
}
function updateUsageStats({ uploadSpeed, watermarkProcessing, errorRates, apiResponseTimes, bandwidthUsage }) {
    const stats = loadUsageStats();
    if (uploadSpeed)
        stats.uploadSpeed.push(uploadSpeed);
    if (watermarkProcessing)
        stats.watermarkProcessing.push(watermarkProcessing);
    if (errorRates)
        stats.errorRates.push(errorRates);
    if (apiResponseTimes)
        stats.apiResponseTimes.push(apiResponseTimes);
    if (bandwidthUsage)
        stats.bandwidthUsage.push(bandwidthUsage);
    saveUsageStats(stats);
}
function updateAnalyticsFull({ username, fileType, fileSize }) {
    const analytics = loadAnalytics();
    // Total uploads
    analytics.uploads = (analytics.uploads || 0) + 1;
    // File type distribution
    analytics.fileTypeDistribution = analytics.fileTypeDistribution || [];
    let typeEntry = analytics.fileTypeDistribution.find(f => f.type === fileType);
    if (typeEntry)
        typeEntry.count += 1;
    else
        analytics.fileTypeDistribution.push({ type: fileType, count: 1 });
    // User activity
    analytics.userActivity = analytics.userActivity || [];
    let userEntry = analytics.userActivity.find(u => u.username === username);
    if (userEntry)
        userEntry.count += 1;
    else
        analytics.userActivity.push({ username, count: 1 });
    // Upload volume
    analytics.uploadVolume = analytics.uploadVolume || [];
    const today = new Date().toISOString().slice(0, 10);
    let volumeEntry = analytics.uploadVolume.find(v => v.date === today);
    if (volumeEntry)
        volumeEntry.count += 1;
    else
        analytics.uploadVolume.push({ date: today, count: 1 });
    // Storage trends
    analytics.totalSize = (analytics.totalSize || 0) + fileSize;
    analytics.storageTrends = analytics.storageTrends || [];
    let storageEntry = analytics.storageTrends.find(s => s.date === today);
    if (storageEntry)
        storageEntry.size = analytics.totalSize;
    else
        analytics.storageTrends.push({ date: today, size: analytics.totalSize });
    saveAnalytics(analytics);
}
// Helper function to sanitize filename
const sanitizeFilename = (filename) => {
    // Remove dangerous characters and spaces
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/_{2,}/g, "_")
        .replace(/^_+|_+$/g, "");
};
// Helper function to get next available number for filename
const getNextFileNumber = (baseName, extension, folder = uploadsDir) => {
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
        const apiKey = req.headers["x-api-key"];
        if (apiKey) {
            // Try to find user's folder
            const usersPath = path.join(uploadsDir, "users");
            if (fs.existsSync(usersPath)) {
                // Look for user folder by checking users.json
                const usersFile = path.join(uploadsDir, "users.json");
                if (fs.existsSync(usersFile)) {
                    try {
                        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
                        const user = users.find((u) => u.apiKey === apiKey);
                        if (user) {
                            // Normalize path for cross-platform compatibility
                            const normalizedPath = user.uploadsFolder.replace(/\\/g, "/");
                            if (fs.existsSync(normalizedPath)) {
                                return cb(null, normalizedPath);
                            }
                        }
                    }
                    catch (error) {
                        // Fall back to main uploads folder
                    }
                }
            }
        }
        // Anonymous users or fallback
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const apiKey = req.headers["x-api-key"];
        let destinationFolder = uploadsDir;
        if (apiKey) {
            const usersFile = path.join(uploadsDir, "users.json");
            if (fs.existsSync(usersFile)) {
                try {
                    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
                    const user = users.find((u) => u.apiKey === apiKey);
                    if (user) {
                        // Normalize path for cross-platform compatibility
                        const normalizedPath = user.uploadsFolder.replace(/\\/g, "/");
                        if (fs.existsSync(normalizedPath)) {
                            destinationFolder = normalizedPath;
                        }
                    }
                }
                catch (error) {
                    // Use default folder
                }
            }
        }
        // Generate a unique, short random name (7-9 chars)
        let finalFilename = "";
        let attempts = 0;
        do {
            const length = Math.floor(Math.random() * 3) + 4; // 4-6 chars
            const randomName = randomString(length);
            finalFilename = `${randomName}${extension}`;
            attempts++;
            if (attempts > 10) {
                finalFilename = `${randomName}${uuidv4().slice(0, 2)}${extension}`;
                break;
            }
        } while (fs.existsSync(path.join(destinationFolder, finalFilename)));
        cb(null, finalFilename);
    },
});
const upload = multer({
    storage,
    limits: {
        fileSize: 30 * 1024 * 1024, // 30MB limit
        files: 1, // Only 1 file at a time
    },
    fileFilter: (_req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed"));
        }
    },
    // Optimize for speed
    preservePath: false,
});
export const uploadMiddleware = upload.single("image");
// Helper function to process watermark
async function processWatermark(filePath, watermarkSettings, username, fastMode = false) {
    // Add a small delay to ensure file is fully written
    await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File does not exist: ${filePath}`);
        throw new Error('Uploaded file not found');
    }
    const imageBuffer = fs.readFileSync(filePath);
    console.log(`File size: ${imageBuffer.length} bytes`);
    // Check if buffer is valid
    if (!imageBuffer || imageBuffer.length === 0) {
        console.error('Read empty file buffer');
        throw new Error('Empty file buffer');
    }
    // Add watermark for registered users
    const watermarkService = WatermarkService.getInstance();
    // Use user's custom settings
    const watermarkOptions = {
        text: watermarkSettings.text,
        position: watermarkSettings.position,
        opacity: watermarkSettings.opacity,
        fontSize: watermarkSettings.fontSize,
        color: watermarkSettings.color,
        padding: watermarkSettings.padding
    };
    console.log(`Watermark options:`, watermarkOptions);
    // Add watermark to image
    console.log(`Adding watermark... (fast mode: ${fastMode})`);
    const watermarkedBuffer = await watermarkService.addWatermark(imageBuffer, watermarkOptions, fastMode);
    if (!watermarkedBuffer || watermarkedBuffer.length === 0) {
        console.error('Watermarking failed: returned empty buffer');
        throw new Error('Watermarking failed');
    }
    console.log(`Watermarked file size: ${watermarkedBuffer.length} bytes`);
    // Save watermarked image (overwrite the original)
    fs.writeFileSync(filePath, watermarkedBuffer);
    console.log(`Watermark added for user: ${username} with text: "${watermarkSettings.text}"`);
}
export const handleUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No image file provided");
    }
    const apiKey = req.headers["x-api-key"];
    let finalFilename = req.file.filename;
    // Add watermark for registered users
    if (apiKey) {
        try {
            const usersFile = path.join(uploadsDir, "users.json");
            if (fs.existsSync(usersFile)) {
                const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
                const user = users.find((u) => u.apiKey === apiKey);
                if (user) {
                    // Check if user has watermark settings and if watermarking is enabled
                    const watermarkSettings = user.watermarkSettings || {
                        enabled: true,
                        text: 'x02.me',
                        position: 'bottom-right',
                        opacity: 0.6,
                        fontSize: 20,
                        color: '#ffffff',
                        padding: 15
                    };
                    if (watermarkSettings.enabled) {
                        console.log(`Processing watermark for user: ${user.username}`);
                        // Get the file path
                        const filePath = path.join(req.file.destination, req.file.filename);
                        // Check if async watermarking is enabled (for speed)
                        const asyncWatermarking = watermarkSettings.async || false;
                        // Check if fast mode is enabled
                        const fastMode = watermarkSettings.fastMode || false;
                        if (asyncWatermarking) {
                            // Process watermark asynchronously (faster upload)
                            setImmediate(async () => {
                                try {
                                    await processWatermark(filePath, watermarkSettings, user.username, fastMode);
                                }
                                catch (error) {
                                    console.error('Async watermarking failed:', error);
                                }
                            });
                            console.log(`Async watermarking queued for user: ${user.username} (fast mode: ${fastMode})`);
                        }
                        else {
                            // Process watermark synchronously
                            await processWatermark(filePath, watermarkSettings, user.username, fastMode);
                        }
                    }
                    else {
                        console.log(`Watermark disabled for user: ${user.username}`);
                    }
                }
            }
        }
        catch (error) {
            console.error('Watermarking error:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            // Continue without watermark if there's an error
        }
    }
    // Generate the correct URL based on subdomain mode and user
    let imageUrl;
    let username = null;
    let userId = null;
    if (apiKey) {
        const usersFile = path.join(uploadsDir, "users.json");
        if (fs.existsSync(usersFile)) {
            try {
                const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
                const user = users.find((u) => u.apiKey === apiKey);
                if (user) {
                    username = user.username.toLowerCase();
                    userId = user.id;
                }
            }
            catch { }
        }
    }
    if (apiKey && username && userId && canUseSubdomain(userId)) {
        imageUrl = `https://${username}.x02.me/i/${finalFilename}`;
    }
    else {
        imageUrl = `https://x02.me/i/${finalFilename}`;
    }
    // Track the upload with API key usage
    updateAnalytics(!!apiKey, req.file.size);
    // Enhanced analytics for charts
    const fileType = path.extname(req.file.filename).replace('.', '').toLowerCase();
    let usernameForAnalytics = 'anonymous';
    if (apiKey) {
        const usersFile = path.join(uploadsDir, "users.json");
        if (fs.existsSync(usersFile)) {
            try {
                const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
                const user = users.find((u) => u.apiKey === apiKey);
                if (user)
                    usernameForAnalytics = user.username;
            }
            catch { }
        }
    }
    updateAnalyticsFull({ username: usernameForAnalytics, fileType, fileSize: req.file.size });
    // Usage stats (mock some data for demo)
    updateUsageStats({
        uploadSpeed: { date: new Date().toISOString().slice(0, 10), speed: Math.random() * 10 + 1 },
        watermarkProcessing: { date: new Date().toISOString().slice(0, 10), ms: Math.floor(Math.random() * 100 + 50) },
        errorRates: { date: new Date().toISOString().slice(0, 10), rate: Math.random() * 0.1 },
        apiResponseTimes: { date: new Date().toISOString().slice(0, 10), ms: Math.floor(Math.random() * 200 + 50) },
        bandwidthUsage: { date: new Date().toISOString().slice(0, 10), mb: req.file.size / (1024 * 1024) }
    });
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
                    filename: finalFilename,
                    size: req.file.size,
                }),
            }).catch((err) => console.log("Usage update failed:", err));
        }
        catch (error) {
            console.log("Usage update error:", error);
        }
    }
    res.type("text/plain").send(imageUrl);
};
export const handleDeleteImage = (req, res) => {
    try {
        const filename = req.params.filename;
        const apiKey = req.headers["x-api-key"];
        let filePath = path.join(uploadsDir, filename);
        console.log(`Delete request for filename: ${filename}, apiKey: ${apiKey ? "provided" : "none"}`);
        // If user has API key, check user-specific folder first
        if (apiKey) {
            const usersFile = path.join(uploadsDir, "users.json");
            if (fs.existsSync(usersFile)) {
                try {
                    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
                    const user = users.find((u) => u.apiKey === apiKey);
                    if (user) {
                        // Normalize path for cross-platform compatibility
                        const userFolder = user.uploadsFolder.replace(/\\/g, "/");
                        const userFilePath = path.join(userFolder, filename);
                        console.log(`Checking user path: ${userFilePath}`);
                        if (fs.existsSync(userFilePath)) {
                            filePath = userFilePath;
                            console.log(`Found file in user folder: ${filePath}`);
                        }
                        else {
                            console.log(`File not found in user folder, checking main: ${filePath}`);
                        }
                    }
                }
                catch (error) {
                    console.log("Error reading users file:", error);
                }
            }
        }
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log(`File not found at path: ${filePath}`);
            return res.status(404).send("File not found");
        }
        // Delete the file
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
        // After deleting, update analytics and usage-stats
        const analytics = loadAnalytics();
        analytics.uploads = Math.max(0, (analytics.uploads || 1) - 1);
        analytics.totalSize = Math.max(0, (analytics.totalSize || 0));
        saveAnalytics(analytics);
        // Optionally, update usage-stats as well (not decrementing arrays, just for demo)
        // Generate the correct URL based on subdomain mode and user
        let imageUrl;
        let username = null;
        let userId = null;
        if (apiKey) {
            const usersFile = path.join(uploadsDir, "users.json");
            if (fs.existsSync(usersFile)) {
                try {
                    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
                    const user = users.find((u) => u.apiKey === apiKey);
                    if (user) {
                        username = user.username.toLowerCase();
                        userId = user.id;
                    }
                }
                catch { }
            }
        }
        if (apiKey && username && userId && canUseSubdomain(userId)) {
            imageUrl = `https://${username}.x02.me/i/${filename}`;
        }
        else {
            imageUrl = `https://x02.me/i/${filename}`;
        }
        res.json({
            success: true,
            message: "Image deleted successfully",
            url: imageUrl
        });
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).send("Error deleting image");
    }
};
