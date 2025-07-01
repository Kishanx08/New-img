export interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
  createdIp: string;
  usage: {
    count: number;
    lastUsed?: string;
  };
  limits: {
    dailyLimit: number;
    hourlyLimit: number;
  };
}

export interface UsageStats {
  [key: string]: {
    count: number;
    lastReset: string;
    uploads: Array<{
      timestamp: string;
      filename: string;
      size: number;
    }>;
  };
}

export interface RateLimit {
  [ipOrKey: string]: {
    count: number;
    resetTime: number;
  };
}

export interface ApiKeyResponse {
  success: boolean;
  data?: {
    apiKey: string;
    limits: {
      dailyLimit: number;
      hourlyLimit: number;
    };
  };
  error?: string;
}

export interface DashboardResponse {
  success: boolean;
  data?: {
    apiKey: string;
    usage: {
      count: number;
      lastUsed?: string;
    };
    limits: {
      dailyLimit: number;
      hourlyLimit: number;
    };
    uploads: Array<{
      filename: string;
      url: string;
      timestamp: string;
      size: number;
    }>;
  };
  error?: string;
}

export interface DeleteImageResponse {
  success: boolean;
  message?: string;
  error?: string;
}
