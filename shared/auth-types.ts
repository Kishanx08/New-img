export interface User {
  id: string;
  username: string;
  passwordHash: string;
  apiKey: string;
  createdAt: string;
  createdIp: string;
  limits: {
    dailyLimit: number;
    hourlyLimit: number;
  };
  usage: {
    count: number;
    lastUsed?: string;
  };
  uploadsFolder: string;
  suspended?: boolean;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: Omit<User, "passwordHash">;
    sessionToken: string;
  };
  error?: string;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: Omit<User, "passwordHash">;
    sessionToken: string;
  };
  error?: string;
}

export interface UserSession {
  username: string;
  apiKey: string;
  sessionToken: string;
  isAnonymous: boolean;
  limits: {
    dailyLimit: number;
    hourlyLimit: number;
  };
}

export interface AnonymousSession {
  isAnonymous: true;
  sessionId: string;
  limits: {
    hourlyLimit: number;
  };
}
