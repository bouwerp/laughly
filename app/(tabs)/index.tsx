import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useJokes } from '../../hooks/useJokes';
import { MediaCard } from '../../components/database/MediaCard';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '../../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  console.log('Index: Rendering start');
  const { jokes, isLoading, error, refetch } = useJokes();
  const { session } = useAuth();
  console.log('Index: Session state:', !!session);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const filters = [
    { name: 'All', icon: 'th-large' },
    { name: 'Memes', icon: 'image' },
    { name: 'Videos', icon: 'video-camera' },
    { name: 'Text', icon: 'file-text' },
    { name: 'Review', icon: 'shield' },
  ];

  const filteredJokes = useMemo(() => {
    if (!jokes) return [];
    
    let result = jokes;

    // Filter by category (mock logic for now based on mediaType)
    if (activeFilter === 'Memes') {
      result = result.filter(j => j.mediaType === 'image');
    } else if (activeFilter === 'Videos') {
      result = result.filter(j => j.mediaType === 'video');
    }

    if (!searchQuery) return result;
    
    const query = searchQuery.toLowerCase();
    return result.filter(joke => 
      joke.title?.toLowerCase().includes(query) || 
      joke.description?.toLowerCase().includes(query) ||
      joke.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [jokes, searchQuery, activeFilter]);

  if (isLoading && !jokes) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#ff272a" />
        <Text className="mt-4 text-muted-foreground font-medium">Fetching your jokes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <FontAwesome name="exclamation-circle" size={48} color="#ff272a" />
        <Text className="text-xl font-bold text-foreground mt-4 text-center px-8">Failed to load jokes</Text>
        <Text className="text-muted-foreground text-center mt-2 font-medium px-8">{error.message || 'Something went wrong.'}</Text>
        <TouchableOpacity className="mt-6 bg-primary px-6 py-3 rounded-full" onPress={() => refetch()}>
          <Text className="text-white font-bold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Header = () => {
    console.log('Index: Rendering Header');
    return (
      <View className="bg-background" style={{ paddingTop: insets.top }}>
        {/* Brand Header */}
        <View className="flex-row items-center justify-between px-4 mb-4">
          <View>
            <Text className="text-2xl font-bold text-foreground leading-6">Laughly</Text>
            <Text className="text-sm font-medium text-muted-foreground">Your meme-heavy archive</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="w-9 h-9 rounded-full bg-card items-center justify-center mr-2 border border-muted/20">
              <FontAwesome name="bell-o" size={18} color="#000" />
            </TouchableOpacity>
            <Image
              source={session?.user?.avatarUrl || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FNorth%20American%2F4"}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-card px-4 py-3 rounded-3xl border border-muted/20">
            <FontAwesome name="search" size={16} color="#949494" />
            <TextInput
              className="flex-1 ml-3 text-foreground text-base font-medium"
              placeholder="Search jokes, memes, captions"
              placeholderTextColor="#949494"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
          contentContainerStyle={{ paddingRight: 32 }}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.name}
              onPress={() => setActiveFilter(filter.name)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                activeFilter === filter.name ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              {filter.name !== 'All' && (
                <FontAwesome 
                  name={filter.icon as any} 
                  size={14} 
                  color={activeFilter === filter.name ? '#fff' : '#ff272a'} 
                  className="mr-2"
                />
              )}
              <Text className={`text-sm font-bold ${
                activeFilter === filter.name ? 'text-white' : 'text-primary'
              }`}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Import Banner */}
        <View className="mx-4 mb-4 p-4 rounded-2xl bg-secondary flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-sm font-bold text-primary">Send memes straight to Laughly</Text>
            <Text className="text-xs font-medium text-primary opacity-80 leading-4">
              Use your share sheet to save screenshots, reels, and posts in one tap.
            </Text>
          </View>
          <TouchableOpacity 
            className="bg-primary px-4 py-2 rounded-full"
            onPress={() => router.push('/(tabs)/create')}
          >
            <Text className="text-white text-xs font-bold">Try it</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  console.log('Index: Rendering FlashList');
  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      
      <FlashList
        data={filteredJokes}
        renderItem={({ item }) => <MediaCard joke={item} />}
        estimatedItemSize={400}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        ListHeaderComponent={Header}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#ff272a" />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center p-8 mt-10">
              <View className="w-20 h-20 bg-muted rounded-full items-center justify-center mb-4">
                <FontAwesome name={searchQuery ? "search" : "archive"} size={32} color="#949494" />
              </View>
              <Text className="text-xl font-bold text-foreground text-center">
                {searchQuery ? 'No jokes found' : 'Your database is empty'}
              </Text>
              <Text className="text-muted-foreground text-center mt-2 font-medium">
                {searchQuery 
                  ? `We couldn't find anything matching "${searchQuery}"`
                  : 'Start saving jokes by uploading them or sharing from other apps!'
                }
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
