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
  const auth = useContext(AuthContext);

  // Refresh profile when component mounts or when userProfile changes
  useEffect(() => {
    if (userProfile) {
      console.log("Profile loaded:", userProfile);
      setIsLoading(false);
      // Only clear local image if we have a server profile image and we're not currently uploading
      // This prevents clearing the local image during upload
      if (userProfile.profileImage && userProfile.profileImage.trim() !== '' && !isUploading) {
        setImage(null);
      }
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
        sendMessage({ type: "set_user_profile" });
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
      setIsUploading(true);
      
      try {
        console.log("Uploading profile image for user:", auth?.userId);
        const uploadResult = await uploadProfileImage(String(auth ? auth.userId : 0), selectedImageUri);
        console.log("Upload result:", uploadResult);
        
        if (uploadResult && uploadResult.status) {
          console.log("Profile image uploaded successfully");
          // Refresh user profile and friend lists after successful upload
          setTimeout(() => {
            sendMessage({ type: "set_user_profile" });
            // Also refresh friend list and chat list to update profile images
            sendMessage({ type: "get_chat_list" });
            sendMessage({ type: "get_all_users" });
            setIsUploading(false);
          }, 2000); // Wait 2 seconds for the upload to complete
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
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{ uri: image }}
            />
          ) : userProfile?.profileImage ? (
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{ uri: userProfile.profileImage }}
            />
          ) : (
            <Image
              className="w-40 h-40 rounded-full border-gray-300 border-2"
              source={{
                uri: `https://ui-avatars.com/api/?name=${userProfile?.firstName || 'User'}+${userProfile?.lastName || 'Name'}&background=random`,
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
