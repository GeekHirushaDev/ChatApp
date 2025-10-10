import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const trendingTopics = [
  {
    title: 'React Native Tips',
    description: 'Best practices and tricks for building mobile apps with React Native.'
  },
  {
    title: 'Expo Updates',
    description: 'Latest features and releases from the Expo team.'
  },
  {
    title: 'UI/UX Inspiration',
    description: 'Modern design ideas for chat and social apps.'
  },
  {
    title: 'Mobile Security',
    description: 'How to keep your app and users safe.'
  },
  {
    title: 'Open Source Projects',
    description: 'Discover trending open source projects in mobile development.'
  },
  {
    title: 'Tech News',
    description: 'Stay updated with the latest technology news.'
  },
  {
    title: 'Startup Stories',
    description: 'Real-world stories from successful tech startups.'
  },
  {
    title: 'Remote Work',
    description: 'Tips for productivity and collaboration in remote teams.'
  },
  {
    title: 'AI in Mobile',
    description: 'How artificial intelligence is changing mobile apps.'
  },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="p-5">
        <FlatList
          data={trendingTopics}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View className="mb-4 p-5 rounded-2xl bg-blue-50 dark:bg-blue-900 shadow-md">
              <Text className="text-xl font-bold text-blue-700 dark:text-blue-200 mb-1">{item.title}</Text>
              <Text className="text-base text-gray-700 dark:text-gray-300">{item.description}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
