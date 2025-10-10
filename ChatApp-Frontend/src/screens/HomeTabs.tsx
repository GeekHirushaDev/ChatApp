import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatsScreen from "./ChatsScreen";
import ExploreScreen from "./ExploreScreen";
import AppSettingsScreen from "./AppSettingsScreen";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

const Tabs = createBottomTabNavigator();

export default function HomeTabs() {
  const { applied } = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({color}) => {
          let iconName = "chatbubble-ellipses";
          if (route.name === "Chats") iconName = "chatbubble-ellipses";
          else if (route.name === "Explore") iconName = "compass";
          else if (route.name === "Settings") iconName = "settings";
          return <Ionicons name={iconName as any} size={28} color={color} />;
        },
        tabBarLabelStyle:{fontSize:16,fontWeight:'800'},
  tabBarActiveTintColor:"#2563eb",
        tabBarInactiveTintColor: applied === "dark" ? "#9ca3af" : "#6b7280",
        tabBarStyle:{
          height:80,
          backgroundColor: applied === "dark" ? "#1f2937" : "#ffffff",
          borderTopColor: applied === "dark" ? "#374151" : "#e5e7eb",
          borderTopWidth: 1,
          paddingTop:8
        }
      })}
    >
      <Tabs.Screen
        name="Chats"
        component={ChatsScreen}
        options={{ headerShown: false }}
      />
      <Tabs.Screen name="Explore" component={ExploreScreen} />
      <Tabs.Screen name="Settings" component={AppSettingsScreen} />
    </Tabs.Navigator>
  );
}
