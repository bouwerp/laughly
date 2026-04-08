import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FontAwesome } from '@expo/vector-icons';
import { services } from '../../services/ServiceContainer';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, Stack } from 'expo-router';

export default function CreateScreen() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Video preview player
  const player = (media?.type === 'video' && media.uri) ? useVideoPlayer(media.uri, (player) => {
    player.loop = true;
    player.play();
  }) : null;

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedia(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!media || !session?.user?.id) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const fileExt = media.uri.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // 1. Upload to Storage with progress
      await services.storageService.uploadFile(
        media.uri, 
        {
          bucket: 'media',
          path: filePath,
          contentType: media.type === 'video' ? 'video/mp4' : 'image/jpeg',
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // 2. Save to Database
      await services.databaseService.insert('jokes', {
        user_id: session.user.id,
        title,
        description,
        tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '') : [],
        media_path: filePath,
        media_type: media.type === 'video' ? 'video' : 'image',
        metadata: {
          width: media.width,
          height: media.height,
          duration: media.duration,
        },
      });

      // 3. Cleanup and Redirect
      queryClient.invalidateQueries({ queryKey: ['jokes'] });
      Alert.alert("Success", "Your joke has been saved to the database!");
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Upload failed', error);
      Alert.alert("Error", "Failed to upload your content. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <Stack.Screen options={{ 
        title: 'Add New Joke',
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: 'bold' }
      }} />
      
      <View className="p-6">
        {/* Media Selector */}
        <TouchableOpacity 
          onPress={pickMedia}
          activeOpacity={0.7}
          className="aspect-square bg-card rounded-[32px] items-center justify-center overflow-hidden mb-6 border border-muted/30"
        >
          {media ? (
            media.type === 'video' && player ? (
              <VideoView player={player} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Image source={media.uri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            )
          ) : (
            <View className="items-center">
              <View className="w-16 h-16 bg-secondary rounded-full items-center justify-center mb-4">
                <FontAwesome name="upload" size={24} color="#ff272a" />
              </View>
              <Text className="text-foreground text-base font-bold">Tap to select a meme or video</Text>
              <Text className="text-muted-foreground mt-1 font-medium">Supports JPG, PNG, and MP4</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Upload Progress Bar */}
        {isUploading && (
          <View className="mb-6">
            <View className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <View 
                className="h-full bg-primary" 
                style={{ width: `${uploadProgress * 100}%` }}
              />
            </View>
            <Text className="text-center text-xs text-muted-foreground mt-2 font-bold uppercase tracking-wider">
              Uploading: {Math.round(uploadProgress * 100)}%
            </Text>
          </View>
        )}

        {/* Inputs */}
        <View className="space-y-4">
          <View className="mb-4">
            <Text className="text-sm font-bold text-foreground mb-2">Title</Text>
            <TextInput
              className="bg-card p-4 rounded-2xl text-foreground font-medium border border-muted/20"
              placeholder="Give your joke a title..."
              placeholderTextColor="#949494"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-bold text-foreground mb-2">Description</Text>
            <TextInput
              className="bg-card p-4 rounded-2xl text-foreground font-medium border border-muted/20 min-h-[100px]"
              placeholder="What makes this funny?"
              placeholderTextColor="#949494"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-bold text-foreground mb-2">Tags (comma separated)</Text>
            <TextInput
              className="bg-card p-4 rounded-2xl text-foreground font-medium border border-muted/20"
              placeholder="meme, cats, work, ..."
              placeholderTextColor="#949494"
              value={tags}
              onChangeText={setTags}
            />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleUpload}
          disabled={!media || isUploading}
          activeOpacity={0.8}
          className={`py-5 rounded-[24px] flex-row items-center justify-center shadow-sm ${
            !media || isUploading ? 'bg-muted/50' : 'bg-primary'
          }`}
        >
          {isUploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <FontAwesome name="plus" size={18} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">Add to Database</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
