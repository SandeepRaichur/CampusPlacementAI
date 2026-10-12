/**
 * Centralized API Configuration for HireNexus
 * Supports local development and production deployments.
 * Set VITE_API_URL in production (e.g., https://campus-placement-api.onrender.com).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

/**
 * Helper to build complete API URLs safely.
 * @param {string} endpoint - API path (e.g., '/api/jobs' or 'api/jobs')
 * @returns {string} - Full API URL
 */
export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
