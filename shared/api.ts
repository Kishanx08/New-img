export interface DemoResponse {
  message: string;
}

export interface UploadResponse {
  success: boolean;
  imageId: string;
  url: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  apiKeyUsed?: boolean;
}

export interface ImageMetadata {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
  views: number;
  apiKey?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

export interface AnalyticsResponse {
  uploads: number;
  apiKeyUsage: number;
  totalSize: number;
  apiKeyUsagePercentage: number;
}

<<<<<<< HEAD
// API Key System Types
export interface ApiKeyData {
  key: string;
  createdAt: string;
  ip: string;
  uploads: number;
  lastUsed?: string;
  isActive: boolean;
}

export interface ApiKeyResponse {
  success: boolean;
  apiKey: string;
  message: string;
}

export interface DashboardStats {
  apiKey: string;
  uploadsCount: number;
  dailyLimit: number;
  remainingUploads: number;
  totalSize: number;
  lastUsed?: string;
  createdAt: string;
}

export interface UserImage {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  uploadedAt: string;
  views: number;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  images: UserImage[];
}

export interface DeleteImageResponse {
  success: boolean;
  message: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
=======
export interface DeleteImageResponse {
  success: boolean;
  message?: string;
  error?: string;
>>>>>>> origin/main
}
