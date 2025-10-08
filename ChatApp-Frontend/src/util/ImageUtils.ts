// Utility functions for handling profile images

const API_BASE_URL = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:8080';
const BACKEND_PATH = '/ChatApp-Backend';

/**
 * Constructs the full URL for a profile image from the backend
 * @param imagePath - The image path returned from the backend (e.g., "profile-images/1/profile1.png")
 * @returns Full URL to the image or null if path is invalid
 * Expected URL format: https://8a167e9c97b7.ngrok-free.app/ChatApp-Backend/profile-images/1/profile1.png
 */
export const getProfileImageUrl = (imagePath: string | null | undefined): string | null => {
  console.log("=== getProfileImageUrl Debug ===");
  console.log("Input imagePath:", imagePath);
  console.log("API_BASE_URL:", API_BASE_URL);
  
  if (!imagePath || imagePath.trim() === '') {
    console.log("Image path is null/empty, returning null");
    return null;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log("Already full URL, returning:", imagePath);
    return imagePath;
  }

  // Handle different path formats
  let cleanPath = imagePath.trim();
  
  // The images are stored directly in ChatApp-Backend/profile-images/ folder
  // Correct URL format: https://8a167e9c97b7.ngrok-free.app/ChatApp-Backend/profile-images/userId/profileX.png
  
  // Remove leading slash if present to avoid double slashes
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Ensure the path starts with profile-images/
  if (!cleanPath.startsWith('profile-images/')) {
    // If the backend returns just a filename or different format, construct the proper path
    console.log("Path doesn't start with profile-images/, attempting to construct it");
    // This might happen if backend returns something like "1/profile1.png" or just "profile1.png"
  }
  
  // Construct the correct URL - adding slash between BACKEND_PATH and cleanPath
  const fullUrl = `${API_BASE_URL}${BACKEND_PATH}/${cleanPath}`;
  
  console.log("Constructed full URL (direct path):", fullUrl);
  console.log("=== End getProfileImageUrl Debug ===");
  
  return fullUrl;
};

/**
 * Generates a fallback avatar URL based on user's name
 * @param nameOrFirstName - User's name or first name
 * @param lastName - User's last name (optional)
 * @returns URL for generated avatar
 */
export const getFallbackAvatarUrl = (nameOrFirstName?: string, lastName?: string): string => {
  let displayName = 'User Name';
  
  if (nameOrFirstName) {
    if (lastName) {
      displayName = `${nameOrFirstName} ${lastName}`;
    } else {
      displayName = nameOrFirstName;
    }
  }
  
  const encodedName = encodeURIComponent(displayName.replace(/ /g, '+'));
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=200&color=ffffff`;
  console.log("Generated fallback URL:", fallbackUrl, "for name:", displayName);
  return fallbackUrl;
};

/**
 * Gets the best available profile image URL
 * @param profileImage - Profile image path from backend
 * @param firstName - User's first name for fallback
 * @param lastName - User's last name for fallback
 * @returns URL to display
 */
export const getBestProfileImageUrl = (
  profileImage?: string | null,
  firstName?: string,
  lastName?: string
): string => {
  console.log("getBestProfileImageUrl called with:", { profileImage, firstName, lastName });
  const imageUrl = getProfileImageUrl(profileImage);
  const result = imageUrl || getFallbackAvatarUrl(firstName, lastName);
  console.log("getBestProfileImageUrl returning:", result);
  return result;
};

/**
 * Test function to verify URL construction and accessibility
 * @param userId - User ID to test
 * @returns Constructed URL for testing
 */
export const testProfileImageUrl = (userId: number): string => {
  const testPath = `profile-images/${userId}/profile1.png`;
  const constructedUrl = getProfileImageUrl(testPath);
  console.log(`TEST: User ${userId} image URL:`, constructedUrl);
  console.log(`Expected: https://8a167e9c97b7.ngrok-free.app/ChatApp-Backend/profile-images/${userId}/profile1.png`);

  // Test the actual URL accessibility
  if (constructedUrl) {
    console.log(`Testing accessibility of: ${constructedUrl}`);
    fetch(constructedUrl, { method: 'HEAD' })
      .then(response => {
        console.log(`URL test result for user ${userId}:`, response.status, response.statusText);
        if (response.ok) {
          console.log(`✅ Profile image URL is accessible for user ${userId}`);
        } else {
          console.log(`❌ Profile image URL returned error for user ${userId}:`, response.status);
        }
      })
      .catch(error => {
        console.log(`❌ Network error testing URL for user ${userId}:`, error);
      });
  }
  
  return constructedUrl || '';
};