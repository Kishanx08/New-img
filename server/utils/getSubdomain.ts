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
   * Validates if a subdomain corresponds to an existing user folder
   *
   * @param subdomain - The subdomain to validate
   * @returns boolean indicating if the user folder exists
   */
  export function isValidUserSubdomain(subdomain: string): boolean {
    if (!subdomain) return false;
  
    // Only allow single-level subdomains for user folders (no dots)
    if (subdomain.includes(".")) return false;
  
    // Check against existing users (you can enhance this to check filesystem)
    const fs = require("fs");
    const path = require("path");
  
    const userFolder = path.join("uploads", "users", subdomain);
    return fs.existsSync(userFolder);
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
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".")
      .replace(/^\.+|\.+$/g, ""); // Remove leading/trailing dots
  
    // Ensure filename is not empty and doesn't start with dot
    if (!sanitized || sanitized.startsWith(".")) {
      return null;
    }
  
    return sanitized;
  }
  