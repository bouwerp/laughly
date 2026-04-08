import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Joke } from '../../core/entities/Joke';
import { FontAwesome } from '@expo/vector-icons';
import { useJokes } from '../../hooks/useJokes';

interface MediaCardProps {
  joke: Joke;
}

export function MediaCard({ joke }: MediaCardProps) {
  const { toggleFavorite, deleteJoke } = useJokes();

  // Initialize video player if it's a video
  const player = joke.mediaType === 'video' ? useVideoPlayer(joke.mediaUrl || '', (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  }) : null;

  const handleDelete = () => {
    Alert.alert(
      "Delete Joke",
      "Are you sure you want to remove this hilarious content?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteJoke.mutate(joke) 
        }
      ]
    );
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <View className="bg-card mb-4 rounded-3xl overflow-hidden border border-muted/20">
      {/* Card Header */}
      <View className="flex-row items-center justify-between p-4 pb-3">
        <View className="flex-row items-center flex-1">
          <Image
            source="https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F18-25%2FHispanic%2F2"
            style={{ width: 36, height: 36, borderRadius: 18 }}
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-foreground truncate" numberOfLines={1}>
              {joke.title || 'Untitled Joke'}
            </Text>
            <Text className="text-xs font-medium text-muted-foreground">
              {timeAgo(joke.createdAt)} · personal archive
            </Text>
          </View>
        </View>
        
        <View className="bg-muted px-2 py-1 rounded-full flex-row items-center">
          <FontAwesome name="shield" size={12} color="#949494" className="mr-1" />
          <Text className="text-[11px] font-bold text-muted-foreground ml-1">Safe</Text>
        </View>
      </View>

      {/* Media Content */}
      <View className="bg-muted aspect-square justify-center">
        {joke.mediaType === 'video' && player ? (
          <VideoView 
            style={{ width: '100%', height: '100%' }}
            player={player}
            contentFit="cover"
          />
        ) : (
          <Image
            source={joke.mediaUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
        )}
      </View>

      {/* Card Actions & Body */}
      <View className="p-4 flex flex-col space-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => toggleFavorite.mutate(joke)} className="flex-row items-center mr-4">
              <FontAwesome 
                name={joke.isFavorite ? "heart" : "heart-o"} 
                size={20} 
                color={joke.isFavorite ? "#ff272a" : "#000"} 
              />
              <Text className="ml-1.5 text-sm font-medium text-foreground">248</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center mr-4">
              <FontAwesome name="comment-o" size={20} color="#000" />
              <Text className="ml-1.5 text-sm font-medium text-foreground">19</Text>
            </TouchableOpacity>
            
            <TouchableOpacity>
              <FontAwesome name="send-o" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={handleDelete}>
            <FontAwesome name="bookmark-o" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        
        {joke.description && (
          <View>
            <Text className="text-[15px] font-medium leading-5 text-foreground">
              <Text className="font-bold mr-2">User</Text> {joke.description}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-muted-foreground">
            {joke.tags && joke.tags.length > 0 ? `Tagged ${joke.tags[0]}` : 'Uncategorized'}
          </Text>
          <Text className="text-xs font-medium text-muted-foreground">
            Google account synced
          </Text>
        </View>
      </View>
    </View>
  );
}
