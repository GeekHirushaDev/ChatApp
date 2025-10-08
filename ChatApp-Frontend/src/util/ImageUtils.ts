// Utility functions for handling profile images

const API_BASE_URL = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:8080';
const BACKEND_PATH = '/ChatApp-Backend';

/**
 * Constructs the full URL for a profile image from the backend
 * @param imagePath - The image path returned from the backend (e.g., "profile-images/1/profile1.png")
 * @returns Full URL to the image or null if path is invalid
 */
export const getProfileImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Handle different path formats
  let cleanPath = imagePath.trim();
  
  // Remove leading slash if present to avoid double slashes
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Construct the correct URL - adding slash between BACKEND_PATH and cleanPath
  const fullUrl = `${API_BASE_URL}${BACKEND_PATH}/${cleanPath}`;
  
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
  const imageUrl = getProfileImageUrl(profileImage);
  return imageUrl || getFallbackAvatarUrl(firstName, lastName);
};

/**
 * Test function to verify URL construction and accessibility
 * @param userId - User ID to test
 * @returns Constructed URL for testing
 */
export const testProfileImageUrl = (userId: number): string => {
  const testPath = `profile-images/${userId}/profile1.png`;
  const constructedUrl = getProfileImageUrl(testPath);
  
  // Test the actual URL accessibility
  if (constructedUrl) {
    fetch(constructedUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          console.log(`Profile image URL error for user ${userId}:`, response.status);
        }
      })
      .catch(error => {
        console.log(`Network error testing URL for user ${userId}:`, error);
      });
  }
  
  return constructedUrl || '';
};