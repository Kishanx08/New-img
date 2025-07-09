import { RequestHandler } from "express";
import crypto from "crypto";
import { Client, GatewayIntentBits } from "discord.js";

// Discord bot configuration
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ADMIN_DISCORD_ID = process.env.ADMIN_DISCORD_ID;
const OTP_EXPIRY_MINUTES = 5;

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map<string, { otp: string; expires: number; used: boolean }>();

// Persistent admin session store (in-memory; use Redis/db for production)
const adminSessions = new Map<string, { expires: number }>();

// Discord bot client
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
  ],
});

// Discord bot connection status
let discordBotConnected = false;

// Initialize Discord bot
if (DISCORD_BOT_TOKEN) {
  console.log("🔄 Attempting to connect Discord bot...");
  
  discordClient.on('ready', () => {
    console.log("✅ Discord bot connected successfully!");
    console.log(`🤖 Bot logged in as: ${discordClient.user?.tag}`);
    discordBotConnected = true;
  });

  discordClient.on('error', (error) => {
    console.error("❌ Discord bot connection error:", error);
    discordBotConnected = false;
  });

  discordClient.on('disconnect', () => {
    console.log("⚠️ Discord bot disconnected");
    discordBotConnected = false;
  });

  discordClient.login(DISCORD_BOT_TOKEN).catch((error) => {
    console.error("❌ Failed to login Discord bot:", error);
    discordBotConnected = false;
  });
} else {
  console.log("⚠️ Discord bot token not found - admin OTP feature disabled");
}

// Generate OTP
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP via Discord
async function sendDiscordOTP(otp: string): Promise<boolean> {
  try {
    if (!ADMIN_DISCORD_ID) {
      console.error("Admin Discord ID not configured");
      return false;
    }

    const user = await discordClient.users.fetch(ADMIN_DISCORD_ID);
    await user.send(`🔐 **Admin Access Code**\n\nYour admin access code is: **${otp}**\n\n⏰ This code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\n⚠️ Do not share this code with anyone.`);
    return true;
  } catch (error) {
    console.error("Failed to send Discord OTP:", error);
    return false;
  }
}

// Request OTP
export const requestAdminOTP: RequestHandler = async (req, res) => {
  try {
    // Check if Discord bot is configured
    console.log("Discord Bot Token:", DISCORD_BOT_TOKEN ? "Set" : "Not set");
    console.log("Admin Discord ID:", ADMIN_DISCORD_ID ? "Set" : "Not set");
    console.log("Discord Bot Connected:", discordBotConnected ? "Yes" : "No");
    
    if (!DISCORD_BOT_TOKEN || !ADMIN_DISCORD_ID) {
      console.error("Discord bot configuration missing:");
      console.error("DISCORD_BOT_TOKEN:", DISCORD_BOT_TOKEN ? "Present" : "Missing");
      console.error("ADMIN_DISCORD_ID:", ADMIN_DISCORD_ID ? "Present" : "Missing");
      return res.status(500).json({
        success: false,
        error: "Discord bot not configured"
      });
    }

    if (!discordBotConnected) {
      console.error("Discord bot is not connected");
      return res.status(500).json({
        success: false,
        error: "Discord bot is not connected. Please check bot token and restart server."
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP
    otpStore.set(sessionId, {
      otp,
      expires: expiresAt,
      used: false
    });

    // Send OTP via Discord
    const sent = await sendDiscordOTP(otp);
    
    if (!sent) {
      otpStore.delete(sessionId);
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP"
      });
    }

    // Clean up expired OTPs
    cleanupExpiredOTPs();

    res.json({
      success: true,
      sessionId,
      message: `OTP sent to Discord DM. Expires in ${OTP_EXPIRY_MINUTES} minutes.`
    });

  } catch (error) {
    console.error("OTP request error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate OTP"
    });
  }
};

// Verify OTP
export const verifyAdminOTP: RequestHandler = async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      return res.status(400).json({
        success: false,
        error: "Session ID and OTP required"
      });
    }

    const storedData = otpStore.get(sessionId);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: "Invalid session ID"
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expires) {
      otpStore.delete(sessionId);
      return res.status(400).json({
        success: false,
        error: "OTP expired"
      });
    }

    // Check if OTP is already used
    if (storedData.used) {
      return res.status(400).json({
        success: false,
        error: "OTP already used"
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP"
      });
    }

    // Mark OTP as used
    storedData.used = true;
    otpStore.set(sessionId, storedData);

    // Generate admin session token
    const adminToken = crypto.randomBytes(32).toString('hex');
    const adminSessionExpires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Store admin session (in production, use Redis/database)
    adminSessions.set(adminToken, { expires: adminSessionExpires });

    // Set adminToken as httpOnly cookie
    res.cookie('adminToken', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: "Admin access granted"
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP"
    });
  }
};

// Clean up expired OTPs
function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [sessionId, data] of otpStore.entries()) {
    if (now > data.expires) {
      otpStore.delete(sessionId);
    }
  }
}

// Middleware to check admin session
export const requireAdminSession = (req: any, res: any, next: any) => {
  // Check for adminToken in cookies first
  const adminToken = req.cookies?.adminToken
    || req.headers['x-admin-token']
    || req.body.adminToken;

  if (!adminToken) {
    return res.status(401).json({
      success: false,
      error: "Admin token required"
    });
  }

  if (!adminSessions.has(adminToken)) {
    return res.status(401).json({
      success: false,
      error: "Invalid admin token"
    });
  }

  next();
}; 