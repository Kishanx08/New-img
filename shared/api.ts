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
