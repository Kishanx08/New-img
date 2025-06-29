import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { AnalyticsResponse } from "@shared/api";

const ANALYTICS_FILE = path.join("uploads", 'analytics.json');

function loadAnalytics() {
  if (!fs.existsSync(ANALYTICS_FILE)) {
    return { uploads: 0, apiKeyUsage: 0, totalSize: 0 };
  }
  return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
}

export const handleAnalytics: RequestHandler = (req, res) => {
  const analytics = loadAnalytics();
  
  const response: AnalyticsResponse = {
    uploads: analytics.uploads,
    apiKeyUsage: analytics.apiKeyUsage,
    totalSize: analytics.totalSize,
    apiKeyUsagePercentage: analytics.uploads > 0 ? Math.round((analytics.apiKeyUsage / analytics.uploads) * 100) : 0
  };

  res.json(response);
}; 