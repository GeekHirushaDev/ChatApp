import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemeOption } from '../theme/ThemeProvider';

const options: ThemeOption[] = ['light', 'dark', 'system'];

export default function AppSettingsScreen() {
  const { preference, setPreference, applied } = useTheme();
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="p-5">
        <Text className="font-bold text-lg mb-2 text-gray-700 dark:text-gray-200">Choose App Theme</Text>
        <View className="flex-row gap-x-3 mt-2">
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              className={`py-2 px-5 rounded-full mb-2 ${preference === option ? 'bg-primary-600' : applied === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
              onPress={() => setPreference(option)}
            >
              <Text className={`text-center font-bold ${applied === 'dark' ? 'text-white' : 'text-black'}`}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
