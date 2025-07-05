import fs from "fs";
import path from "path";

/**
 * Extracts the subdomain from a hostname that ends with 'x02.me'
 *
 * @param hostname - The hostname from the request (e.g., 'kapoor.x02.me')
 * @returns The subdomain (e.g., 'kapoor') or null if invalid
 *
 * Examples:
 * - getSubdomain('kapoor.x02.me') → 'kapoor'
 * - getSubdomain('kishan.x02.me') → 'kishan'
 * - getSubdomain('test.kishan.x02.me') → 'test.kishan' (supports multi-level)
 * - getSubdomain('x02.me') → null (no subdomain)
 * - getSubdomain('example.com') → null (wrong domain)
 * - getSubdomain('localhost') → null (not x02.me)
 */
export function getSubdomain(hostname: string): string | null {
    if (!hostname || typeof hostname !== "string") {
      return null;
    }
  
    // Normalize hostname to lowercase
    const normalizedHostname = hostname.toLowerCase().trim();
  
    // Check if hostname ends with .x02.me
    if (!normalizedHostname.endsWith(".x02.me")) {
      return null;
    }
  
    // Extract everything before '.x02.me'
    const subdomain = normalizedHostname.slice(0, -".x02.me".length);
  
    // Return null if no subdomain (just 'x02.me')
    if (!subdomain || subdomain.length === 0) {
      return null;
    }
  
    // Validate subdomain format (alphanumeric, hyphens, dots)
    const validSubdomainRegex = /^[a-z0-9.-]+$/;
    if (!validSubdomainRegex.test(subdomain)) {
      return null;
    }
  
    // Prevent directory traversal attempts
    if (
      subdomain.includes("..") ||
      subdomain.includes("/") ||
      subdomain.includes("\\")
    ) {
      return null;
    }
  
    return subdomain;
  }
  
  /**
   * Validates if a subdomain corresponds to an existing user folder (case-insensitive)
   *
   * @param subdomain - The subdomain to validate
   * @returns boolean indicating if the user folder exists
   */
  export function isValidUserSubdomain(subdomain: string): boolean {
    if (!subdomain) return false;
  
    const usersDir = path.join("uploads", "users");
    
    // Check if users directory exists
    if (!fs.existsSync(usersDir)) return false;
  
    // Get all user directories
    const userDirs = fs.readdirSync(usersDir);
    
    // Check if any directory matches the subdomain (case-insensitive)
    return userDirs.some(dir => 
      dir.toLowerCase() === subdomain.toLowerCase() && 
      fs.statSync(path.join(usersDir, dir)).isDirectory()
    );
  }
  
  /**
   * Gets the actual case-sensitive folder name for a subdomain
   */
  export function getActualUserFolder(subdomain: string): string | null {
    if (!subdomain) return null;
  
    const usersDir = path.join("uploads", "users");
    
    if (!fs.existsSync(usersDir)) return null;
  
    const userDirs = fs.readdirSync(usersDir);
    
    const actualFolder = userDirs.find(dir => 
      dir.toLowerCase() === subdomain.toLowerCase() && 
      fs.statSync(path.join(usersDir, dir)).isDirectory()
    );
    
    return actualFolder || null;
  }
  
  /**
   * Sanitizes a filename to prevent directory traversal and other security issues
   *
   * @param filename - The filename to sanitize
   * @returns Sanitized filename or null if invalid
   */
  export function sanitizeFilename(filename: string): string | null {
    if (!filename || typeof filename !== "string") {
      return null;
    }
  
    // Remove any path separators and dangerous characters
    const sanitized = filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_+|_+$/g, "");
  
    // Ensure filename is not empty and doesn't start with dot
    if (!sanitized || sanitized.startsWith(".")) {
      return null;
    }
  
    // Check for path traversal attempts
    if (sanitized.includes("..") || sanitized.includes("/") || sanitized.includes("\\")) {
      return null;
    }
  
    return sanitized;
  }
  