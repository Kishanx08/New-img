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

export interface DeleteImageResponse {
  success: boolean;
  message?: string;
  error?: string;
}
