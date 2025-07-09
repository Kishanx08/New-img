import express from 'express';
import fs from 'fs';
import path from 'path';
import { requireAdminSession } from './admin-auth';

const router = express.Router();
const SETTINGS_PATH = path.join(__dirname, '../../subdomain-settings.json');

// GET all subdomain settings
router.get('/', requireAdminSession, (req, res) => {
  if (!fs.existsSync(SETTINGS_PATH)) return res.json({});
  const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  res.json(settings);
});

// POST update a user's subdomainEnabled flag
router.post('/', requireAdminSession, (req, res) => {
  const { username, enabled } = req.body;
  if (!username || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'username and enabled (boolean) required' });
  }
  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  }
  settings[username] = enabled;
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  res.json({ success: true, username, enabled });
});

export default router; 