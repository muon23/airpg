// Get the current window location
const getCurrentLocation = () => {
  if (typeof window !== 'undefined') {
    return window.location;
  }
  return null;
};

// Determine API URL based on UI URL
const determineApiUrl = (): string => {
  const location = getCurrentLocation();
  if (!location) return 'http://localhost:8000';

  // If we're in development (localhost:3000), use localhost:8000
  if (location.hostname === 'localhost' && location.port === '3000') {
    return 'http://localhost:8000';
  }

  // For production, use the same host but different port
  // This assumes the API is running on the same host but port 8000
  return `${location.protocol}//${location.hostname}:8000`;
};

export const config = {
  apiUrl: determineApiUrl(),
}; 