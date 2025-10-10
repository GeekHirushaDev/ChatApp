import { useEffect } from "react";
import { Image, StatusBar, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import CircleShape from "../components/CircleShape";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStack } from "../../App";
import { runOnJS } from "react-native-worklets";
import { useTheme } from "../theme/ThemeProvider";
import { useWebSocketPing } from "../socket/UseWebSocketPing";

type Props = NativeStackNavigationProp<RootStack, "SplashScreen">;

export default function SplashScreen() {
  const navigation = useNavigation<Props>();
  const opacity = useSharedValue(0);
  useWebSocketPing(60000); // 1000 * 60 * 4
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 3000 });
    // const timer = setTimeout(() => {
    //   navigation.replace("SignUpScreen");
    // }, 3000);

    // return () => {
    //   clearTimeout(timer);
    // };
  }, [navigation, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return { opacity: opacity.value };
  });

  const { applied } = useTheme();
  const logo =
    applied === "light"
      ? require("../../assets/logo-dark.png")
      : require("../../assets/logo.png");

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gradient-to-b from-blue-500 to-slate-50">
      <StatusBar hidden={true} />
      <Animated.View style={animatedStyle}>
        <Image
          source={logo}
          style={{ height: 180, width: 200, resizeMode: "contain" }}
        />
      </Animated.View>

      <Animated.View
        className="absolute bottom-10 w-full px-8"
        style={animatedStyle}
      >
        <View className="justify-center items-center">
          <Text className="text-base font-semibold text-slate-700 text-center">
            Connect. Share. Discover.
          </Text>
          <Text className="text-xs font-medium text-slate-500 mt-2">
            Version: {process.env.EXPO_PUBLIC_APP_VERSION}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
