// API Key for authentication
export const API_KEY = "23b1f555338093877bf1a45d1a82582fd4789f6863933b091f06f7dce8c600ca";

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
}
