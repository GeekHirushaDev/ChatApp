import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export default function StatusScreen() {
  const { applied } = useTheme();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: applied === "dark" ? "black" : "white",
      },
      headerTintColor: applied === "dark" ? "white" : "black",
      headerTitleStyle: {
        color: applied === "dark" ? "white" : "black",
      },
    });
  }, [navigation, applied]);

  return (
    <SafeAreaView className={`flex-1 ${applied === "dark" ? "bg-black" : "bg-white"}`}>
      <View className="flex-1 justify-center items-center">
        <Text className={`text-lg ${applied === "dark" ? "text-white" : "text-black"}`}>
          Status Screen
        </Text>
      </View>
    </SafeAreaView>
  );
}
