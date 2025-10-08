import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { RootStack } from "../../App";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useContext, useLayoutEffect, useState, useEffect } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUserProfile } from "../socket/UseUserProfile";
import { uploadProfileImage } from "../api/UserService";
import { AuthContext } from "../components/AuthProvider";
import { useWebSocket } from "../socket/WebSocketProvider";
import { getProfileImageUrl, getFallbackAvatarUrl, getBestProfileImageUrl, testProfileImageUrl } from "../util/ImageUtils";
import { debugImageUrl, findWorkingImageUrl } from "../util/ImageTestUtils";

type ProfileScreenProp = NativeStackNavigationProp<RootStack, "ProfileScreen">;
export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenProp>();
  const { applied } = useTheme();
  const userProfile = useUserProfile();
  const { sendMessage, isConnected } = useWebSocket();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "My Profile",
      headerStyle: {
        backgroundColor: applied === "dark" ? "black" : "white",
      },
      headerTintColor: applied === "dark" ? "white" : "black",
    });
  }, [navigation, applied]);

  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(null);
  const auth = useContext(AuthContext);

  // Refresh profile when component mounts or when userProfile changes
  useEffect(() => {
    if (userProfile) {
      console.log("=== PROFILE SCREEN DEBUG ===");
      console.log("Full userProfile object:", JSON.stringify(userProfile, null, 2));
      console.log("Profile image path from backend:", userProfile.profileImage);
      console.log("User ID:", userProfile.id);
      console.log("First Name:", userProfile.firstName);
      console.log("Last Name:", userProfile.lastName);
      
      // Test URL construction for this user
      if (userProfile.id) {
        testProfileImageUrl(userProfile.id);
      }
      
      setIsLoading(false);
      
      // Update profile image if available from server and we're not currently uploading
      const profileImageUrl = getProfileImageUrl(userProfile.profileImage);
      console.log("Constructed profile image URL:", profileImageUrl);
      
      // Also test the direct expected URL format
      if (userProfile.id) {
        const expectedUrl = `https://8a167e9c97b7.ngrok-free.app/ChatApp-Backend/profile-images/${userProfile.id}/profile1.png`;
        console.log("Expected direct URL:", expectedUrl);
        
        // Test if the expected URL works
        fetch(expectedUrl, { method: 'HEAD' })
          .then(response => {
            console.log("Expected URL test result:", response.status, response.statusText);
            if (response.ok) {
              console.log("✅ Expected URL is working, using it directly");
              setLocalProfileImage(expectedUrl);
            } else if (profileImageUrl && !isUploading) {
              console.log("Expected URL failed, using constructed URL:", profileImageUrl);
              setLocalProfileImage(profileImageUrl);
            }
          })
          .catch(error => {
            console.log("Expected URL test failed:", error);
            if (profileImageUrl && !isUploading) {
              console.log("Using constructed URL from backend path:", profileImageUrl);
              setLocalProfileImage(profileImageUrl);
            }
          });
      } else if (profileImageUrl && !isUploading) {
        console.log("Setting profile image URL:", profileImageUrl);
        setLocalProfileImage(profileImageUrl);
        
        // Also test the URL accessibility for debugging
        if (userProfile.profileImage) {
          debugImageUrl(userProfile.profileImage, "Profile Screen");
        }
      } else {
        console.log("No valid profile image URL or currently uploading");
        console.log("profileImageUrl:", profileImageUrl);
        console.log("isUploading:", isUploading);
      }
      
      console.log("=== END PROFILE SCREEN DEBUG ===");
    }
  }, [userProfile, isUploading]);

  // Request profile data when WebSocket is connected
  useEffect(() => {
    if (isConnected && auth?.userId) {
      console.log("WebSocket connected, requesting profile data for user:", auth.userId);
      sendMessage({ type: "set_user_profile" });
    }
  }, [isConnected, auth?.userId, sendMessage]);

  // Request profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isConnected && auth?.userId) {
        console.log("Profile screen focused, requesting profile data");
        setImage(null); // Clear temporary image state when screen gains focus
        setLocalProfileImage(null); // Clear cached image to force refresh
        sendMessage({ type: "set_user_profile" });
        
        // Also request fresh data after a short delay to ensure backend has processed any recent uploads
        setTimeout(() => {
          console.log("Requesting fresh profile data after delay");
          sendMessage({ type: "set_user_profile" });
        }, 500);
      }
    }, [isConnected, auth?.userId, sendMessage])
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setImage(selectedImageUri);
      setLocalProfileImage(selectedImageUri); // Set local profile image immediately
      setIsUploading(true);
      
      try {
        console.log("Uploading profile image for user:", auth?.userId);
        const uploadResult = await uploadProfileImage(String(auth ? auth.userId : 0), selectedImageUri);
        console.log("Upload result:", uploadResult);
        
        if (uploadResult && uploadResult.status) {
          console.log("Profile image uploaded successfully");
          // Update local profile image with server URL if available
          if (uploadResult.profileImageUrl) {
            console.log("Server returned profile image URL:", uploadResult.profileImageUrl);
            setLocalProfileImage(uploadResult.profileImageUrl);
          } else if (uploadResult.imagePath) {
            console.log("Server returned image path:", uploadResult.imagePath);
            const fullUrl = getProfileImageUrl(uploadResult.imagePath);
            console.log("Constructed full URL:", fullUrl);
            setLocalProfileImage(fullUrl);
          }
          // Refresh user profile and friend lists after successful upload
          setTimeout(() => {
            sendMessage({ type: "set_user_profile" });
            // Also refresh friend list and chat list to update profile images
            sendMessage({ type: "get_chat_list" });
            sendMessage({ type: "get_all_users" });
            setIsUploading(false);
            setImage(null); // Clear temporary image
          }, 1000); // Reduced wait time
        } else {
          console.error("Profile image upload failed:", uploadResult?.message);
          setIsUploading(false);
          // Keep the local image even if upload fails
        }
      } catch (error) {
        console.error("Profile image upload failed:", error);
        setIsUploading(false);
        // Keep the local image even if upload fails
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${applied === "dark" ? "bg-black" : "bg-white"}`}>
        <View className="items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className={`mt-4 text-lg font-semibold ${applied === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 items-center justify-center ${applied === "dark" ? "bg-black" : "bg-white"}`}>
      <View className="flex-1 mt-10 w-full p-5">
        <View className="items-center ">
          {image ? (
            // Show temporary local image during upload
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{ uri: image }}
              onError={(error) => {
                console.log("Failed to load temporary image:", image);
                console.log("Error:", error.nativeEvent.error);
              }}
            />
          ) : localProfileImage ? (
            // Show cached profile image
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{ uri: localProfileImage }}
              onLoad={() => {
                console.log("Successfully loaded local profile image:", localProfileImage);
              }}
              onError={(error) => {
                console.log("Failed to load local profile image:", localProfileImage);
                console.log("Error:", error.nativeEvent.error);
                // Try to construct URL again with current profile data
                if (userProfile?.profileImage) {
                  const retryUrl = getProfileImageUrl(userProfile.profileImage);
                  console.log("Retry URL constructed:", retryUrl);
                  if (retryUrl && retryUrl !== localProfileImage) {
                    console.log("Attempting retry with different URL");
                    setLocalProfileImage(retryUrl);
                  } else {
                    // Clear the failed local image and fall back
                    setLocalProfileImage(null);
                  }
                } else {
                  // Clear the failed local image and fall back
                  setLocalProfileImage(null);
                }
              }}
            />
          ) : userProfile?.profileImage ? (
            // Show profile image directly from userProfile
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{ uri: getBestProfileImageUrl(userProfile.profileImage, userProfile.firstName, userProfile.lastName) }}
              onLoad={() => {
                const imageUrl = getBestProfileImageUrl(userProfile.profileImage, userProfile.firstName, userProfile.lastName);
                console.log("Successfully loaded user profile image:", imageUrl);
              }}
              onError={(error) => {
                console.log("Failed to load user profile image directly");
                console.log("Original path:", userProfile.profileImage);
                const constructedUrl = getBestProfileImageUrl(userProfile.profileImage, userProfile.firstName, userProfile.lastName);
                console.log("Constructed URL:", constructedUrl);
                console.log("Error:", error.nativeEvent.error);
                
                // Try alternative URL construction
                const directUrl = getProfileImageUrl(userProfile.profileImage);
                console.log("Direct URL attempt:", directUrl);
                
                // Force fallback to generated avatar if image fails
                console.log("Forcing fallback to generated avatar");
              }}
            />
          ) : (
            // Show fallback avatar
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{
                uri: getFallbackAvatarUrl(userProfile?.firstName, userProfile?.lastName),
              }}
            />
          )}
        </View>
        <View className="my-1">
          <TouchableOpacity
            className="justify-center items-center h-12"
            onPress={() => {
              if (!isUploading) {
                pickImage();
              }
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#10B981" />
                <Text className="font-bold text-green-600 text-lg ml-2">
                  Uploading...
                </Text>
              </View>
            ) : (
              <Text className="font-bold text-green-600 text-lg">
                Edit Profile
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="justify-start flex-col gap-y-2 my-3">
          <View className="flex-row gap-x-3 items-center">
            <Feather name="user" size={24} color={applied === "dark" ? "white" : "black"} />
            <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-black"}`}>Name</Text>
          </View>
          <Text className={`font-bold text-lg ${applied === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {userProfile?.firstName || 'Not available'} {userProfile?.lastName || ''}
          </Text>
        </View>
        <View className="justify-start flex-col gap-y-2 my-3">
          <View className="flex-row gap-x-3 items-center">
            <Feather name="phone" size={24} color={applied === "dark" ? "white" : "black"} />
            <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-black"}`}>Phone</Text>
          </View>
          <Text className={`font-bold text-lg ${applied === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {userProfile?.countryCode || ''} {userProfile?.contactNo || 'Not available'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
