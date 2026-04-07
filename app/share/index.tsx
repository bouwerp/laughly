import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useShareIntent } from 'expo-share-intent';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { services } from '../../services/ServiceContainer';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function ShareIntentScreen() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const { session, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Video preview player
  const player = (shareIntent.type === 'video' && shareIntent.value) ? useVideoPlayer(shareIntent.value, (player) => {
    player.loop = true;
    player.play();
  }) : null;

  useEffect(() => {
    if (error) {
      console.error("Share Intent Error:", error);
      Alert.alert("Error", "Could not process shared content.");
    }
  }, [error]);

  const handleSave = async () => {
    if (!shareIntent.value || !session?.user?.id) return;

    try {
      setIsUploading(true);
      
      const fileExt = shareIntent.value.split('.').pop() || (shareIntent.type === 'video' ? 'mp4' : 'jpg');
      const fileName = `shared-${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // 1. Upload to Storage
      await services.storageService.uploadFile(shareIntent.value, {
        bucket: 'media',
        path: filePath,
        contentType: shareIntent.type === 'video' ? 'video/mp4' : 'image/jpeg',
      });

      // 2. Save to Database
      await services.databaseService.insert('jokes', {
        user_id: session.user.id,
        title: title || "Shared via Laughly",
        description,
        media_path: filePath,
        media_type: shareIntent.type === 'video' ? 'video' : 'image',
      });

      // 3. Cleanup
      queryClient.invalidateQueries({ queryKey: ['jokes'] });
      resetShareIntent();
      Alert.alert("Success", "Saved to your database!");
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Share Intent Save Failed', error);
      Alert.alert("Error", "Failed to save shared content.");
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!hasShareIntent) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-gray-500 text-center">No content shared with Laughly.</Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')}
          className="mt-4 bg-yellow-400 px-6 py-3 rounded-xl"
        >
          <Text className="font-bold">Go to App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-gray-900">Save to Laughly</Text>
        <Text className="text-gray-500 mt-1">Add this to your funny collection</Text>
      </View>

      {/* Preview */}
      <View className="aspect-square bg-gray-100 rounded-3xl overflow-hidden mb-6">
        {shareIntent.type === 'video' && player ? (
          <VideoView player={player} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Image source={shareIntent.value} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        )}
      </View>

      {/* Form */}
      <View className="space-y-4">
        <TextInput
          className="bg-gray-50 p-4 rounded-xl border border-gray-100"
          placeholder="Joke Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[80px]"
          placeholder="Description (Optional)"
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Buttons */}
      <View className="flex-row space-x-4 mt-8">
        <TouchableOpacity 
          onPress={() => { resetShareIntent(); router.replace('/(tabs)'); }}
          className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
        >
          <Text className="text-gray-600 font-bold">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isUploading}
          className="flex-1 bg-yellow-400 py-4 rounded-xl items-center"
        >
          {isUploading ? <ActivityIndicator color="black" /> : <Text className="text-black font-bold">Save Joke</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
