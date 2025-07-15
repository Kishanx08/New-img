#!/bin/bash

APP_DIR="/home/kishanx08/New-img"
PM2_CONFIG="ecosystem.config.json"
BRANCH="main"  # change if your branch is 'master'

echo "📦 Changing to app directory..."
cd "$APP_DIR" || { echo "❌ Failed to change directory"; exit 1; }

echo "🛑 Stopping PM2 app..."
pm2 stop "$PM2_CONFIG"

echo "📤 Pulling latest code from GitHub ($BRANCH)..."
git pull origin "$BRANCH" || { echo "❌ Git pull failed"; exit 1; }

echo "📦 Installing dependencies..."
npm install || { echo "❌ npm install failed"; exit 1; }

echo "🔨 Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "🚀 Restarting PM2 app..."
pm2 start "$PM2_CONFIG"
pm2 save

echo "✅ Deployment complete!"
