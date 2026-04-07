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

  return (
    <View className="bg-white mb-6 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        <View>
          {joke.title && (
            <Text className="text-lg font-bold text-gray-900">{joke.title}</Text>
          )}
          <Text className="text-xs text-gray-400">
            {new Date(joke.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <FontAwesome name="ellipsis-h" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Media Content */}
      <View className="bg-gray-50 aspect-square justify-center">
        {joke.mediaType === 'video' && player ? (
          <VideoView 
            style={{ width: '100%', height: '100%' }}
            player={player}
            contentFit="cover"
            allowsFullscreen
            allowsPictureInPicture
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

      {/* Footer/Actions */}
      <View className="p-4 flex-row items-center justify-between">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => toggleFavorite.mutate(joke)} className="mr-4">
            <FontAwesome 
              name={joke.isFavorite ? "heart" : "heart-o"} 
              size={24} 
              color={joke.isFavorite ? "#EF4444" : "#374151"} 
            />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <FontAwesome name="share-square-o" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        
        {joke.tags && joke.tags.length > 0 && (
          <View className="flex-row">
            {joke.tags.slice(0, 2).map((tag) => (
              <View key={tag} className="bg-gray-100 px-2 py-1 rounded-full ml-1">
                <Text className="text-[10px] text-gray-600">#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {joke.description && (
        <View className="px-4 pb-4">
          <Text className="text-gray-700">{joke.description}</Text>
        </View>
      )}
    </View>
  );
}
