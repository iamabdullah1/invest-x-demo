/**
 * Utility functions for handling dynamic URLs in development
 */

/**
 * Get the current base URL dynamically
 * Works in both client and server environments
 */
export function getBaseUrl(): string {
  // Browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development environment
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

/**
 * Create absolute URLs for API endpoints
 */
export function createApiUrl(endpoint: string): string {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Get the current host and port
 */
export function getHostInfo() {
  if (typeof window !== 'undefined') {
    return {
      host: window.location.hostname,
      port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
      protocol: window.location.protocol,
      origin: window.location.origin
    };
  }
  
  return {
    host: 'localhost',
    port: process.env.PORT || '3000',
    protocol: 'http:',
    origin: `http://localhost:${process.env.PORT || '3000'}`
  };
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're running on a specific port
 */
export function isRunningOnPort(port: string | number): boolean {
  if (typeof window !== 'undefined') {
    return window.location.port === port.toString();
  }
  return process.env.PORT === port.toString();
}
