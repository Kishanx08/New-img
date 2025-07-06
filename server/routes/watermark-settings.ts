import { RequestHandler, Router } from "express";
import fs from "fs";
import path from "path";

interface WatermarkSettings {
  enabled: boolean;
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
  padding: number;
  async?: boolean;
}

const router = Router();

// Get watermark settings for a user
export const getWatermarkSettings: RequestHandler = async (req, res) => {
  const apiKey = req.headers["x-api-key"] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const usersFile = path.join("uploads", "users.json");
    if (!fs.existsSync(usersFile)) {
      return res.status(404).json({ error: "User not found" });
    }

    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    const user = users.find((u: any) => u.apiKey === apiKey);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return default settings if user doesn't have custom settings
    const settings: WatermarkSettings = user.watermarkSettings || {
      enabled: true,
      text: 'x02.me',
      position: 'bottom-right',
      opacity: 0.6,
      fontSize: 20,
      color: '#ffffff',
      padding: 15,
      async: false
    };

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error getting watermark settings:', error);
    res.status(500).json({ error: "Failed to get watermark settings" });
  }
};

// Update watermark settings for a user
export const updateWatermarkSettings: RequestHandler = async (req, res) => {
  const apiKey = req.headers["x-api-key"] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const { enabled, text, position, opacity, fontSize, color, padding, async } = req.body;
    
    // Validate input
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }
    
    if (typeof text !== 'string' || text.length === 0) {
      return res.status(400).json({ error: "text must be a non-empty string" });
    }
    
    const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
    if (!validPositions.includes(position)) {
      return res.status(400).json({ error: "Invalid position" });
    }
    
    if (typeof opacity !== 'number' || opacity < 0 || opacity > 1) {
      return res.status(400).json({ error: "opacity must be a number between 0 and 1" });
    }
    
    if (typeof fontSize !== 'number' || fontSize < 8 || fontSize > 100) {
      return res.status(400).json({ error: "fontSize must be a number between 8 and 100" });
    }
    
    if (typeof color !== 'string' || !color.match(/^#[0-9A-F]{6}$/i)) {
      return res.status(400).json({ error: "color must be a valid hex color" });
    }
    
    if (typeof padding !== 'number' || padding < 0 || padding > 100) {
      return res.status(400).json({ error: "padding must be a number between 0 and 100" });
    }
    
    if (async !== undefined && typeof async !== 'boolean') {
      return res.status(400).json({ error: "async must be a boolean" });
    }

    const usersFile = path.join("uploads", "users.json");
    if (!fs.existsSync(usersFile)) {
      return res.status(404).json({ error: "User not found" });
    }

    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    const userIndex = users.findIndex((u: any) => u.apiKey === apiKey);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user's watermark settings
    users[userIndex].watermarkSettings = {
      enabled,
      text,
      position,
      opacity,
      fontSize,
      color,
      padding,
      async: async || false
    };

    // Save updated users file
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ 
      success: true, 
      message: "Watermark settings updated successfully",
      settings: users[userIndex].watermarkSettings
    });
  } catch (error) {
    console.error('Error updating watermark settings:', error);
    res.status(500).json({ error: "Failed to update watermark settings" });
  }
};

// Routes
router.get('/settings', getWatermarkSettings);
router.post('/settings', updateWatermarkSettings);

export default router; 