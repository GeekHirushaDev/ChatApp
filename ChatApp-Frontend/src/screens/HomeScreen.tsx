import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStack } from "../../App";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useChatList } from "../socket/UseChatList";
import { formatChatTime } from "../util/DateFormatter";
import { Chat } from "../socket/chat";
import { AuthContext } from "../components/AuthProvider";
import { useTheme } from "../theme/ThemeProvider";
import { useWebSocket } from "../socket/WebSocketProvider";
import { getProfileImageUrl, getFallbackAvatarUrl, getBestProfileImageUrl } from "../util/ImageUtils";
import React from "react";

type HomeScreenProps = NativeStackNavigationProp<RootStack, "HomeScreen">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenProps>();
  const [search, setSearch] = useState("");
  const chatList = useChatList();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCameraVisible, setCameraVisible] = useState(false);
  const [isContextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const auth = useContext(AuthContext);
  const { applied } = useTheme();
  const { sendMessage, isConnected } = useWebSocket();

  // Refresh chat list when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isConnected) {
        sendMessage({ type: "get_chat_list" });
      }
    }, [isConnected, sendMessage])
  );

  const handleLongPress = (item: Chat) => {
    setSelectedChat(item);
    setContextMenuVisible(true);
  };

  const handleDeleteChat = () => {
    if (selectedChat && auth?.userId) {
      Alert.alert(
        "Delete Chat",
        `Are you sure you want to delete the chat with ${selectedChat.friendName}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              sendMessage({ 
                type: "delete_chat", 
                userId: auth.userId, 
                friendId: selectedChat.friendId 
              });
              setContextMenuVisible(false);
              setSelectedChat(null);
            },
          },
        ]
      );
    }
  };

  const handleClearMessages = () => {
    if (selectedChat && auth?.userId) {
      Alert.alert(
        "Clear All Messages",
        `Are you sure you want to clear all messages with ${selectedChat.friendName}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Clear",
            style: "destructive",
            onPress: () => {
              sendMessage({ 
                type: "clear_messages", 
                userId: auth.userId, 
                friendId: selectedChat.friendId 
              });
              setContextMenuVisible(false);
              setSelectedChat(null);
            },
          },
        ]
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <SafeAreaView edges={["top"]} className={applied === "dark" ? "bg-black" : "bg-white"}>
          <View
            className={`h-20 justify-center items-center flex-row shadow-2xl elevation-2xl ${
              applied === "dark" ? "bg-black" : "bg-white"
            } ${Platform.OS === "ios" ? `py-5` : `py-0`}`}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: applied === "dark" ? "#374151" : "#e5e7eb",
            }}
          >
            <View className="flex-1 items-start ms-3">
              <Text className={`font-bold text-2xl ${applied === "dark" ? "text-white" : "text-black"}`}>Social Chat</Text>
            </View>
            <View className="me-3">
              <View className="flex-row space-x-4">
                <TouchableOpacity className="me-5" onPress={() => setCameraVisible(true)}>
                  <Ionicons name="camera" size={26} color={applied === "dark" ? "white" : "black"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Ionicons name="ellipsis-vertical" size={24} color={applied === "dark" ? "white" : "black"} />
                </TouchableOpacity>
                {/* 3-dot menu modal */}
                <Modal
                  animationType="fade"
                  visible={isModalVisible}
                  transparent={true}
                  onRequestClose={() => setModalVisible(false)}
                >
                  <Pressable
                    className="flex-1 bg-transparent"
                    onPress={() => {
                      setModalVisible(false);
                    }}
                  >
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <View className="justify-end items-end p-5">
                        <View
                          className={`rounded-xl w-64 p-4 ${applied === "dark" ? "bg-gray-900" : "bg-white"}`}
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                          }}
                        >
                          <TouchableOpacity
                            className={`h-12 my-2 flex-row items-center border-b ${applied === "dark" ? "border-b-gray-700" : "border-b-gray-200"}`}
                            onPress={() => {
                              navigation.navigate("ProfileScreen");
                              setModalVisible(false);
                            }}
                          >
                            <Ionicons name="person" size={22} color={applied === "dark" ? "white" : "#2563EB"} style={{marginRight: 12}} />
                            <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-black"}`}>My Profile</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className={`h-12 my-2 flex-row items-center border-b ${applied === "dark" ? "border-b-gray-700" : "border-b-gray-200"}`}
                            onPress={() => {
                              navigation.navigate("SettingScreen");
                              setModalVisible(false);
                            }}
                          >
                            <Ionicons name="color-palette" size={22} color={applied === "dark" ? "white" : "#2563EB"} style={{marginRight: 12}} />
                            <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-black"}`}>Theme</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className={`h-12 my-2 flex-row items-center border-b ${applied === "dark" ? "border-b-gray-700" : "border-b-gray-200"}`}
                            onPress={() => {
                              if (auth) auth.signOut();
                            }}
                          >
                            <Ionicons name="log-out" size={22} color={applied === "dark" ? "white" : "#EF4444"} style={{marginRight: 12}} />
                            <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-black"}`}>Log Out</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Pressable>
                  </Pressable>
                </Modal>
                {/* Camera modal */}
                <Modal
                  animationType="slide"
                  visible={isCameraVisible}
                  transparent={false}
                  onRequestClose={() => setCameraVisible(false)}
                >
                  <View className="flex-1 bg-black justify-center items-center">
                    {/* Camera UI placeholder, replace with Expo Camera */}
                    <Text className="text-white text-lg mb-4">Camera</Text>
                    <TouchableOpacity className="absolute top-10 right-10" onPress={() => setCameraVisible(false)}>
                      <Ionicons name="close-circle" size={36} color="white" />
                    </TouchableOpacity>
                    {/* TODO: Integrate Expo Camera here */}
                  </View>
                </Modal>
              </View>
            </View>
          </View>
        </SafeAreaView>
      ),
    });
  }, [navigation, isModalVisible, applied]);

  // Context Menu Modal
  const renderContextMenu = () => (
    <Modal
      animationType="fade"
      visible={isContextMenuVisible}
      transparent={true}
      onRequestClose={() => setContextMenuVisible(false)}
    >
      <Pressable
        className="flex-1 bg-transparent"
        onPress={() => {
          setContextMenuVisible(false);
          setSelectedChat(null);
        }}
      >
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
          }}
        >
          <View className="justify-center items-center flex-1">
            <View
              className={`rounded-lg w-64 p-4 ${applied === "dark" ? "bg-gray-800" : "bg-white"}`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Text className={`text-lg font-bold mb-4 text-center ${applied === "dark" ? "text-white" : "text-black"}`}>
                {selectedChat?.friendName}
              </Text>
              
              <TouchableOpacity
                className={`h-12 my-2 justify-center items-center rounded-lg ${applied === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                onPress={handleClearMessages}
              >
                <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-black"}`}>
                  Clear All Messages
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`h-12 my-2 justify-center items-center rounded-lg ${applied === "dark" ? "bg-red-800" : "bg-red-100"}`}
                onPress={handleDeleteChat}
              >
                <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-red-600"}`}>
                  Delete Chat
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`h-12 my-2 justify-center items-center rounded-lg ${applied === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                onPress={() => {
                  setContextMenuVisible(false);
                  setSelectedChat(null);
                }}
              >
                <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-black"}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const filterdChats = [...chatList]
    .filter((chat) => {
      return (
        chat.friendName.toLowerCase().includes(search.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort(
      (a, b) =>
        new Date(b.lastTimeStamp).getTime() -
        new Date(a.lastTimeStamp).getTime()
    );

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      className={`flex-row items-center py-2 px-3 my-0.5 ${
        applied === "dark" ? "bg-gray-800" : "bg-gray-50"
      }`}
      onPress={() => {
        navigation.navigate("SingleChatScreen", {
          chatId: item.friendId,
          friendName: item.friendName,
          lastSeenTime: formatChatTime(item.lastTimeStamp),
          profileImage: getBestProfileImageUrl(item.profileImage, item.friendName)
        });
      }}
      onLongPress={() => handleLongPress(item)}
    >
      <TouchableOpacity className="h-14 w-14 rounded-full border-1 border-gray-300 justify-center items-center">
        <Image
          source={{
            uri: `${getProfileImageUrl(`profile-images/${item.friendId}/profile1.png`)}?cb=${Date.now()}`
          }}
          className="h-14 w-14 rounded-full"
        />
      </TouchableOpacity>
      <View className="flex-1 ms-3">
        <View className="flex-row justify-between">
          <Text
            className={`font-bold text-xl ${
              applied === "dark" ? "text-white" : "text-gray-800"
            }`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.friendName}
          </Text>
          <Text className={`font-bold text-xs ${
            applied === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            {formatChatTime(item.lastTimeStamp)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text
            className={`flex-1 text-base ${
              applied === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View className="bg-primary-500 rounded-full px-2 py-2 ms-2">
              <Text className="text-slate-50 text-xs font-bold">
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className={`flex-1 p-0 ${applied === "dark" ? "bg-black" : "bg-gradient-to-b from-blue-100 to-white"}`}
      edges={["top", "right", "bottom", "left"]}
    >
      <StatusBar hidden={false} />
      {/* Search Bar */}
      <View className={`items-center flex-row mx-4 border-2 rounded-full px-4 h-14 mt-6 shadow-md ${
        applied === "dark" ? "border-gray-600 bg-gray-900" : "border-blue-200 bg-white"
      }`}>
        <Ionicons name="search" size={22} color={applied === "dark" ? "#60A5FA" : "#2563EB"} />
        <TextInput
          className={`flex-1 text-lg font-semibold ps-2 ${
            applied === "dark" ? "text-white" : "text-black"
          }`}
          placeholder="Search chats or friends..."
          placeholderTextColor={applied === "dark" ? "#60A5FA" : "#2563EB"}
          value={search}
          onChangeText={(text) => setSearch(text)}
        />
      </View>
      {/* Modern Chat List */}
      <View className="mt-4 flex-1">
        <FlatList
          data={filterdChats}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`flex-row items-center p-4 mb-3 rounded-2xl shadow-lg ${applied === "dark" ? "bg-gray-800" : "bg-white"}`}
              onPress={() => {
                navigation.navigate("SingleChatScreen", {
                  chatId: item.friendId,
                  friendName: item.friendName,
                  lastSeenTime: formatChatTime(item.lastTimeStamp),
                  profileImage: getBestProfileImageUrl(item.profileImage, item.friendName)
                });
              }}
              onLongPress={() => handleLongPress(item)}
            >
              <Image
                source={{ uri: `${getProfileImageUrl(`profile-images/${item.friendId}/profile1.png`)}?cb=${Date.now()}` }}
                className="h-16 w-16 rounded-full border-2 border-blue-400 mr-4"
              />
              <View className="flex-1">
                <View className="flex-row justify-between items-center">
                  <Text className={`font-bold text-lg ${applied === "dark" ? "text-white" : "text-gray-800"}`} numberOfLines={1} ellipsizeMode="tail">
                    {item.friendName}
                  </Text>
                  <Text className={`font-bold text-xs ${applied === "dark" ? "text-gray-400" : "text-gray-500"}`}>{formatChatTime(item.lastTimeStamp)}</Text>
                </View>
                <View className="flex-row justify-between items-center mt-1">
                  <Text className={`flex-1 text-base ${applied === "dark" ? "text-gray-400" : "text-gray-500"}`} numberOfLines={1} ellipsizeMode="tail">
                    {item.lastMessage}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View className="bg-blue-600 rounded-full px-3 py-1 ml-2">
                      <Text className="text-white text-xs font-bold">
                        {item.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </View>
      {/* Enhanced Footer Floating Button */}
      <View className="absolute bottom-8 right-8">
        <TouchableOpacity
          className="h-20 w-20 rounded-full bg-blue-600 justify-center items-center shadow-2xl border-4 border-white"
          onPress={() => navigation.navigate("NewChatScreen")}
        >
          <Ionicons name="chatbox-ellipses" size={36} color="white" />
        </TouchableOpacity>
      </View>
      {/* SafeAreaView for bottom space */}
      <View className="h-8" />
      {renderContextMenu()}
    </SafeAreaView>
  );
}
