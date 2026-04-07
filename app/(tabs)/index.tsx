import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useJokes } from '../../hooks/useJokes';
import { MediaCard } from '../../components/database/MediaCard';
import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function FeedScreen() {
  const { jokes, isLoading, refetch } = useJokes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJokes = useMemo(() => {
    if (!jokes) return [];
    if (!searchQuery) return jokes;
    
    const query = searchQuery.toLowerCase();
    return jokes.filter(joke => 
      joke.title?.toLowerCase().includes(query) || 
      joke.description?.toLowerCase().includes(query) ||
      joke.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [jokes, searchQuery]);

  if (isLoading && !jokes) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{ 
          title: 'My Database',
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#f9fafb' },
        }} 
      />
      
      <View className="px-4 py-2">
        <View className="flex-row items-center bg-gray-200/50 px-4 py-3 rounded-2xl">
          <FontAwesome name="search" size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 text-base"
            placeholder="Search jokes, tags, descriptions..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>
      
      {filteredJokes.length > 0 ? (
        <FlashList
          data={filteredJokes}
          renderItem={({ item }) => <MediaCard joke={item} />}
          estimatedItemSize={400}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">{searchQuery ? '🔍' : '📭'}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center">
            {searchQuery ? 'No jokes found' : 'Your database is empty'}
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            {searchQuery 
              ? `We couldn't find anything matching "${searchQuery}"`
              : 'Start saving jokes by uploading them or sharing from other apps!'
            }
          </Text>
        </View>
      )}
    </View>
  );
}
