import express from 'express';
import fs from 'fs';
import path from 'path';
import { requireAdminSession } from './admin-auth';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const SETTINGS_PATH = path.join(__dirname, '../../subdomain-settings.json');
const MODE_PATH = path.join(__dirname, '../../subdomain-mode.json');
// GET all subdomain settings
router.get('/', requireAdminSession, (req, res) => {
    if (!fs.existsSync(SETTINGS_PATH))
        return res.json({});
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
// GET global subdomain mode
router.get('/mode', requireAdminSession, (req, res) => {
    let mode = 'enabled';
    if (fs.existsSync(MODE_PATH)) {
        const data = JSON.parse(fs.readFileSync(MODE_PATH, 'utf-8'));
        mode = data.mode || 'enabled';
    }
    res.json({ mode });
});
// POST set global subdomain mode
router.post('/mode', requireAdminSession, (req, res) => {
    const { mode } = req.body;
    if (!['enabled', 'disabled', 'per-user'].includes(mode)) {
        return res.status(400).json({ error: 'Invalid mode' });
    }
    fs.writeFileSync(MODE_PATH, JSON.stringify({ mode }, null, 2));
    res.json({ success: true, mode });
});
export default router;
