import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStack } from "../../App";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSingleChat } from "../socket/UseSingleChat";
import { Chat } from "../socket/chat";
import { formatChatTime } from "../util/DateFormatter";
import { useSendChat } from "../socket/UseSendChat";
import { useTheme } from "../theme/ThemeProvider";
import { getProfileImageUrl, getFallbackAvatarUrl, getBestProfileImageUrl } from "../util/ImageUtils";

type SingleChatScreenProps = NativeStackScreenProps<
  RootStack,
  "SingleChatScreen"
>;
export default function SingleChatScreen({
  route,
  navigation,
}: SingleChatScreenProps) {
  const { chatId, friendName, lastSeenTime, profileImage } = route.params;
  const singleChat = useSingleChat(chatId); // chatId == friendId
  const messages = singleChat.messages;
  const friend = singleChat.friend;
  const sendMessage = useSendChat();
  const [input, setInput] = useState("");
  const { applied } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerStyle: {
        backgroundColor: applied === "dark" ? "black" : "white",
      },
      headerLeft: () => (
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="justify-center items-center"
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back-sharp" size={24} color={applied === "dark" ? "white" : "black"} />
          </TouchableOpacity>
          <TouchableOpacity className="h-14 w-14 rounded-full border-1 border-gray-300 justify-center items-center">
            <Image
              source={{
                uri: `${getProfileImageUrl(`profile-images/${chatId}/profile1.png`)}?cb=${Date.now()}`
              }}
              className="h-14 w-14 rounded-full"
            />
          </TouchableOpacity>
          <View className="space-y-2 ">
            <Text className={`font-bold text-2xl ${applied === "dark" ? "text-white" : "text-black"}`}>
              {friendName || friend?.displayName || `${friend?.firstName ?? ""} ${friend?.lastName ?? ""}`.trim()}
            </Text>
            <Text className={`italic text-xs font-bold ${applied === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {friend?.status === "ONLINE"
                ? "Online"
                : `Last seen ${formatChatTime(friend?.updatedAt ?? "")}`}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={applied === "dark" ? "white" : "black"} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, friend, applied]);

  const renderItem = ({ item }: { item: Chat }) => {
    const isMe = item.from.id !== chatId;
    return (
      <View
        className={`my-1 px-3 py-2 max-w-[75%] ${
          isMe
            ? `self-end bg-primary-700 rounded-tl-xl rounded-bl-xl rounded-br-xl`
            : `rounded-tr-xl rounded-bl-xl rounded-br-xl self-start bg-gray-700`
        }`}
      >
        <Text className={`text-white text-base`}>{item.message}</Text>
        <View className="flex-row justify-end items-center mt-1">
          <Text className={`text-white italic text-xs me-2`}>
            {formatChatTime(item.createdAt)}
          </Text>
          {isMe && (
            <Ionicons
              name={
                item.status === "READ"
                  ? "checkmark-done-sharp"
                  : item.status === "DELIVERED"
                  ? "checkmark-done-sharp"
                  : "checkmark"
              }
              size={20}
              color={item.status === "READ" ? "#0284c7" : "#9ca3af"}
            />
          )}
        </View>
      </View>
    );
  };

  const handleSendChat = () => {
    if (!input.trim()) {
      return;
    }
    sendMessage(chatId, input);
    setInput("");
  };

  return (
    <SafeAreaView
      className={`flex-1 ${applied === "dark" ? "bg-black" : "bg-white"}`}
      edges={["right", "bottom", "left"]}
    >
      <StatusBar hidden={false} />
      <KeyboardAvoidingView
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "android" ? 0 : 50}
        behavior={Platform.OS === "android" ? "padding" : "height"}
      >
        <FlatList
          data={messages} //Chat[]
          renderItem={renderItem}
          className="px-3 flex-1"
          inverted
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
        <View className={`flex-row items-end p-2 ${applied === "dark" ? "bg-black" : "bg-white"}`}>
          <TextInput
            value={input}
            onChangeText={(text) => setInput(text)}
            multiline
            placeholder="Type a message"
            placeholderTextColor={applied === "dark" ? "gray" : "gray"}
            className={`flex-1 min-h-14 max-h-32 h-auto px-5 py-2 rounded-3xl text-base ${
              applied === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
            }`}
          />
          <TouchableOpacity
            className="bg-primary-600 w-14 h-14 items-center justify-center rounded-full"
            onPress={handleSendChat}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
