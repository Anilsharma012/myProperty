/**
 * API Utilities for handling environment-based URL generation
 * This module provides utilities to create API URLs that work across all environments
 */

// Get the base URL from environment variables
const getBaseUrl = (): string => {
  // Check for VITE_BASE_URL first (primary environment variable for Railway, Vercel, etc.)
  if (import.meta.env.VITE_BASE_URL) {
    console.log("🌐 Using VITE_BASE_URL:", import.meta.env.VITE_BASE_URL);
    return import.meta.env.VITE_BASE_URL;
  }

  // Check for legacy VITE_API_BASE_URL for backward compatibility
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log("🌐 Using VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }

  // For development or when no base URL is set
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    
    // Development environment detection
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      console.log("🏠 Development environment detected, using relative URLs");
      return "";
    }

    // Production environment - use current domain
    console.log("🌍 Production environment, using current domain");
    return `${protocol}//${hostname}${port && port !== "80" && port !== "443" ? `:${port}` : ""}`;
  }

  return "";
};

// Create API URL with base URL prefix
export const createApiUrl = (endpoint: string): string => {
  const baseUrl = getBaseUrl();
  
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  
  // Remove 'api/' prefix if already present in endpoint
  const apiEndpoint = cleanEndpoint.startsWith("api/") ? cleanEndpoint : `api/${cleanEndpoint}`;
  
  // Construct the full URL
  const fullUrl = baseUrl ? `${baseUrl}/${apiEndpoint}` : `/${apiEndpoint}`;
  
  console.log("🔗 API URL:", fullUrl, "| Base:", baseUrl, "| Endpoint:", endpoint);
  return fullUrl;
};

// Utility for making fetch requests with proper URL handling
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = createApiUrl(endpoint);
  
  // Set default headers
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  console.log(`🚀 API Request: ${options.method || "GET"} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });
  
  console.log(`📡 API Response: ${response.status} ${response.statusText}`);
  return response;
};

// Convenience methods for common HTTP operations
export const apiGet = (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  return apiFetch(endpoint, { ...options, method: "GET" });
};

export const apiPost = (endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> => {
  return apiFetch(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiPut = (endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> => {
  return apiFetch(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiDelete = (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  return apiFetch(endpoint, { ...options, method: "DELETE" });
};

// Export the base URL getter for other modules
export { getBaseUrl };
