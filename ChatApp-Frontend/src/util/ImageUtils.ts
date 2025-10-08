// Utility functions for handling profile images

const API_BASE_URL = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:8080';
const BACKEND_PATH = '/ChatApp-Backend';

/**
 * Constructs the full URL for a profile image from the backend
 * @param imagePath - The image path returned from the backend (e.g., "profile-images/1/profile1.png")
 * @returns Full URL to the image or null if path is invalid
 * Expected URL format: https://566917d7c764.ngrok-free.app/ChatApp-Backend/profile-images/1/profile1.png
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
  // Correct URL format: https://domain.com/ChatApp-Backend/profile-images/userId/profileX.png
  
  // If the path doesn't start with /, add it
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // Construct the correct URL WITHOUT /web prefix
  const fullUrl = `${API_BASE_URL}${BACKEND_PATH}${cleanPath}`;
  
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
 * Test function to verify URL construction
 * @param userId - User ID to test
 * @returns Constructed URL for testing
 */
export const testProfileImageUrl = (userId: number): string => {
  const testPath = `profile-images/${userId}/profile${userId}.png`;
  const constructedUrl = getProfileImageUrl(testPath);
  console.log(`TEST: User ${userId} image URL:`, constructedUrl);
  console.log(`Expected: https://566917d7c764.ngrok-free.app/ChatApp-Backend/profile-images/${userId}/profile${userId}.png`);
  return constructedUrl || '';
};