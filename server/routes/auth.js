import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
const USERS_FILE = path.join("uploads", "users.json");
const SALT_ROUNDS = 12;
// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
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
function getClientIp(req) {
    return (req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        "unknown");
}
function createUserFolder(username) {
    const lowerUsername = username.toLowerCase();
    const userFolder = path.join("uploads", "users", lowerUsername);
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
    }
    // Normalize path separators for cross-platform compatibility
    return userFolder.replace(/\\/g, "/");
}
export const registerUser = async (req, res) => {
    try {
        let { username, password } = req.body;
        if (!username || !password) {
            const response = {
                success: false,
                error: "Username and password are required",
            };
            return res.status(400).json(response);
        }
        // Remove special characters for subdomain compatibility
        const originalUsername = username;
        const blockedChars = Array.from(new Set((originalUsername.match(/[^a-z0-9]/gi) || []))).join(' ');
        username = username
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ""); // Only keep lowercase letters and numbers
        // Validate username (alphanumeric, 3-20 chars)
        if (!/^[a-z0-9]{3,20}$/.test(username)) {
            let errorMsg = "Username must be 3-20 characters and contain only lowercase letters and numbers.";
            if (blockedChars.length > 0) {
                errorMsg = `Your username contained blocked characters: [${blockedChars}].\nExample: johndoe2024`;
            }
            const response = {
                success: false,
                error: errorMsg,
                sanitizedUsername: username,
            };
            return res.status(400).json(response);
        }
        // Validate password (min 6 chars)
        if (password.length < 6) {
            const response = {
                success: false,
                error: "Password must be at least 6 characters long",
            };
            return res.status(400).json(response);
        }
        const users = loadUsers();
        // Check if username already exists
        if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
            const response = {
                success: false,
                error: "Username already exists",
            };
            return res.status(409).json(response);
        }
        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const userFolder = createUserFolder(username);
        const newUser = {
            id: uuidv4(),
            username: username,
            passwordHash,
            apiKey: uuidv4().replace(/-/g, ""),
            createdAt: new Date().toISOString(),
            createdIp: getClientIp(req),
            limits: {
                dailyLimit: 100,
                hourlyLimit: 25,
            },
            usage: {
                count: 0,
            },
            uploadsFolder: userFolder,
        };
        users.push(newUser);
        saveUsers(users);
        // Create session token
        const sessionToken = uuidv4();
        // Return user data without password hash
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        const response = {
            success: true,
            data: {
                user: userWithoutPassword,
                sessionToken,
            },
            message: "User registered successfully",
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Registration error:", error);
        const response = {
            success: false,
            error: "Failed to register user",
        };
        res.status(500).json(response);
    }
};
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            const response = {
                success: false,
                error: "Username and password are required",
            };
            return res.status(400).json(response);
        }
        const users = loadUsers();
        const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
        if (!user) {
            const response = {
                success: false,
                error: "Invalid username or password",
            };
            return res.status(401).json(response);
        }
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            const response = {
                success: false,
                error: "Invalid username or password",
            };
            return res.status(401).json(response);
        }
        // Create session token
        const sessionToken = uuidv4();
        // Return user data without password hash
        const { passwordHash: _, ...userWithoutPassword } = user;
        const response = {
            success: true,
            data: {
                user: userWithoutPassword,
                sessionToken,
            },
        };
        res.json(response);
    }
    catch (error) {
        console.error("Login error:", error);
        const response = {
            success: false,
            error: "Failed to log in",
        };
        res.status(500).json(response);
    }
};
export const getUserByApiKey = (req, res) => {
    try {
        const apiKey = req.params.apiKey;
        const users = loadUsers();
        const user = users.find((u) => u.apiKey === apiKey);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }
        const { passwordHash: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            data: { user: userWithoutPassword },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to get user",
        });
    }
};
export const updateUserUsage = (req, res) => {
    try {
        const apiKey = req.params.apiKey;
        const { filename, size } = req.body;
        const users = loadUsers();
        const userIndex = users.findIndex((u) => u.apiKey === apiKey);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }
        users[userIndex].usage.count++;
        users[userIndex].usage.lastUsed = new Date().toISOString();
        saveUsers(users);
        res.json({
            success: true,
            message: "Usage updated",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to update usage",
        });
    }
};
