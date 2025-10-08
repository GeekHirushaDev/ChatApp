// Test utility to verify if profile images are accessible
import { getProfileImageUrl } from './ImageUtils';

const API_BASE_URL = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:8080';
const BACKEND_PATH = '/ChatApp-Backend';

/**
 * Tests multiple URL formats to find the working one
 * @param imagePath - The image path from backend
 * @returns Promise<string | null> - The working URL or null
 */
export const findWorkingImageUrl = async (imagePath: string): Promise<string | null> => {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Different URL formats to try
  const urlsToTest = [
    // Standard backend path
    `${API_BASE_URL}${BACKEND_PATH}${cleanPath}`,
    // Direct path
    `${API_BASE_URL}${cleanPath}`,
    // Build/web path
    `${API_BASE_URL}${BACKEND_PATH}/build/web${cleanPath}`,
    // Without leading slash
    `${API_BASE_URL}${BACKEND_PATH}/${imagePath}`,
    // Just the image path as relative
    `${API_BASE_URL}/${imagePath}`,
    // With static prefix
    `${API_BASE_URL}${BACKEND_PATH}/static${cleanPath}`,
    // Web folder direct
    `${API_BASE_URL}/web${cleanPath}`,
  ];

  console.log("=== TESTING MULTIPLE IMAGE URL FORMATS ===");
  console.log("Original path:", imagePath);

  for (let i = 0; i < urlsToTest.length; i++) {
    const url = urlsToTest[i];
    console.log(`Testing URL ${i + 1}:`, url);
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`URL ${i + 1} Response:`, response.status, response.statusText);
      
      if (response.ok) {
        console.log(`✅ WORKING URL FOUND: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`URL ${i + 1} Error:`, error);
    }
  }

  console.log("❌ No working URL found for image:", imagePath);
  console.log("=== END URL TESTING ===");
  return null;
};

/**
 * Tests if a profile image URL is accessible
 * @param imagePath - The image path from backend
 * @returns Promise<boolean> - Whether the image is accessible
 */
export const testImageUrl = async (imagePath: string): Promise<boolean> => {
  const workingUrl = await findWorkingImageUrl(imagePath);
  return workingUrl !== null;
};

/**
 * Tests and logs detailed information about an image URL
 * @param imagePath - The image path from backend
 * @param context - Context for logging (e.g., "Profile Screen", "Chat List")
 */
export const debugImageUrl = async (imagePath: string, context: string = "Unknown") => {
  console.log(`\n=== IMAGE DEBUG (${context}) ===`);
  console.log("Original path:", imagePath);
  
  const workingUrl = await findWorkingImageUrl(imagePath);
  
  if (workingUrl) {
    console.log("✅ Working URL found:", workingUrl);
  } else {
    console.log("❌ No working URL found");
    console.log("Suggestion: Check if backend is serving static files correctly");
    console.log("Base URL:", API_BASE_URL);
    console.log("Backend Path:", BACKEND_PATH);
  }
  
  console.log(`=== END IMAGE DEBUG (${context}) ===\n`);
  
  return workingUrl;
};