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
import { getProfileImageUrl, getFallbackAvatarUrl, getBestProfileImageUrl } from "../util/ImageUtils";

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
      setIsLoading(false);
      
      // Update profile image if available from server and we're not currently uploading
      const profileImageUrl = getProfileImageUrl(userProfile.profileImage);
      
      // Test the direct expected URL format first
      if (userProfile.id) {
        const expectedUrl = `${process.env.EXPO_PUBLIC_APP_URL}/ChatApp-Backend/profile-images/${userProfile.id}/profile1.png`;

        // Test if the expected URL works
        fetch(expectedUrl, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              setLocalProfileImage(expectedUrl);
            } else if (profileImageUrl && !isUploading) {
              setLocalProfileImage(profileImageUrl);
            }
          })
          .catch(error => {
            if (profileImageUrl && !isUploading) {
              setLocalProfileImage(profileImageUrl);
            }
          });
      } else if (profileImageUrl && !isUploading) {
        setLocalProfileImage(profileImageUrl);
      }
    }
  }, [userProfile, isUploading]);

  // Request profile data when WebSocket is connected
  useEffect(() => {
    if (isConnected && auth?.userId) {
      sendMessage({ type: "set_user_profile" });
    }
  }, [isConnected, auth?.userId, sendMessage]);

  // Request profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isConnected && auth?.userId) {
        setImage(null); // Clear temporary image state when screen gains focus
        setLocalProfileImage(null); // Clear cached image to force refresh
        sendMessage({ type: "set_user_profile" });
        
        // Also request fresh data after a short delay to ensure backend has processed any recent uploads
        setTimeout(() => {
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
      setLocalProfileImage(selectedImageUri); // Show local image immediately
      setIsUploading(true);

      try {
        const uploadResult = await uploadProfileImage(String(auth ? auth.userId : 0), selectedImageUri);

        // Force immediate refresh of profile and chat list
        setLocalProfileImage(null);
        setImage(null);
        sendMessage({ type: "set_user_profile" });
        sendMessage({ type: "get_chat_list" });
        sendMessage({ type: "get_all_users" });
        setIsUploading(false);
      } catch (error) {
        setIsUploading(false);
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
            />
          ) : localProfileImage ? (
            // Show cached profile image
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{ uri: localProfileImage ? `${localProfileImage}?cb=${Date.now()}` : undefined }}
              onError={() => setLocalProfileImage(null)}
            />
          ) : userProfile?.profileImage ? (
            // Show profile image directly from userProfile
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{ uri: getBestProfileImageUrl(userProfile.profileImage, userProfile.firstName, userProfile.lastName) }}
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
