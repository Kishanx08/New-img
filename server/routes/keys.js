import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
const KEYS_FILE = path.join("uploads", "api-keys.json");
const USAGE_FILE = path.join("uploads", "usage-stats.json");
function loadApiKeys() {
    if (!fs.existsSync(KEYS_FILE))
        return [];
    try {
        return JSON.parse(fs.readFileSync(KEYS_FILE, "utf-8"));
    }
    catch {
        return [];
    }
}
function saveApiKeys(keys) {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}
function loadUsageStats() {
    if (!fs.existsSync(USAGE_FILE))
        return {};
    try {
        return JSON.parse(fs.readFileSync(USAGE_FILE, "utf-8"));
    }
    catch {
        return {};
    }
}
function saveUsageStats(stats) {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(stats, null, 2));
}
function getClientIp(req) {
    return (req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        "unknown");
}
export const generateApiKey = (req, res) => {
    try {
        const keys = loadApiKeys();
        const clientIp = getClientIp(req);
        // Check if IP already has a key (limit one key per IP)
        const existingKey = keys.find((k) => k.createdIp === clientIp);
        if (existingKey) {
            const response = {
                success: true,
                data: {
                    apiKey: existingKey.key,
                    limits: existingKey.limits,
                },
            };
            return res.json(response);
        }
        const newApiKey = {
            id: uuidv4(),
            key: uuidv4().replace(/-/g, ""),
            createdAt: new Date().toISOString(),
            createdIp: clientIp,
            usage: {
                count: 0,
            },
            limits: {
                dailyLimit: 50,
                hourlyLimit: 20,
            },
        };
        keys.push(newApiKey);
        saveApiKeys(keys);
        const response = {
            success: true,
            data: {
                apiKey: newApiKey.key,
                limits: newApiKey.limits,
            },
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: "Failed to generate API key",
        };
        res.status(500).json(response);
    }
};
export const getDashboard = (req, res) => {
    try {
        const apiKey = req.query.key;
        if (!apiKey) {
            const response = {
                success: false,
                error: "API key is required",
            };
            return res.status(400).json(response);
        }
        const keys = loadApiKeys();
        const keyData = keys.find((k) => k.key === apiKey);
        if (!keyData) {
            const response = {
                success: false,
                error: "Invalid API key",
            };
            return res.status(404).json(response);
        }
        const usageStats = loadUsageStats();
        const keyUsage = usageStats[apiKey] || { uploads: [] };
        const response = {
            success: true,
            data: {
                apiKey: keyData.key,
                usage: keyData.usage,
                limits: keyData.limits,
                uploads: keyUsage.uploads || [],
            },
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: "Failed to fetch dashboard data",
        };
        res.status(500).json(response);
    }
};
export const regenerateApiKey = (req, res) => {
    try {
        const oldKey = req.body.oldKey;
        if (!oldKey) {
            const response = {
                success: false,
                error: "Old API key is required",
            };
            return res.status(400).json(response);
        }
        const keys = loadApiKeys();
        const keyIndex = keys.findIndex((k) => k.key === oldKey);
        if (keyIndex === -1) {
            const response = {
                success: false,
                error: "Invalid API key",
            };
            return res.status(404).json(response);
        }
        // Generate new key but keep same metadata
        const oldKeyData = keys[keyIndex];
        const newKey = uuidv4().replace(/-/g, "");
        keys[keyIndex] = {
            ...oldKeyData,
            key: newKey,
            usage: { count: 0 }, // Reset usage
        };
        saveApiKeys(keys);
        // Clear old usage stats and create new empty ones
        const usageStats = loadUsageStats();
        delete usageStats[oldKey];
        usageStats[newKey] = { uploads: [] };
        saveUsageStats(usageStats);
        const response = {
            success: true,
            data: {
                apiKey: newKey,
                limits: keys[keyIndex].limits,
            },
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: "Failed to regenerate API key",
        };
        res.status(500).json(response);
    }
};
