import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useShareIntent } from 'expo-share-intent';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { services } from '../../services/ServiceContainer';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function ShareIndex() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const { session, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      setIsModerating(true);
      
      // 1. AI Moderation Check (Phase 7)
      const textToModerate = `${title} ${description}`.trim();
      if (textToModerate) {
        const result = await services.moderationService.moderateText(textToModerate);
        if (!result.isSafe) {
          Alert.alert("Content Flagged", `Sorry, this content was flagged: ${result.reason}`);
          setIsModerating(false);
          return;
        }
      }

      setIsModerating(false);
      setIsUploading(true);
      setUploadProgress(0);
      
      const fileExt = shareIntent.value.split('.').pop() || (shareIntent.type === 'video' ? 'mp4' : 'jpg');
      const fileName = `shared-${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // 2. Upload to Storage with progress
      await services.storageService.uploadFile(
        shareIntent.value, 
        {
          bucket: 'media',
          path: filePath,
          contentType: shareIntent.type === 'video' ? 'video/mp4' : 'image/jpeg',
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // 3. Save to Database
      await services.databaseService.insert('jokes', {
        user_id: session.user.id,
        title: title || "Shared via Laughly",
        description,
        tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '') : [],
        media_path: filePath,
        media_type: shareIntent.type === 'video' ? 'video' : 'image',
        metadata: {
          moderation_status: 'safe',
          moderated_at: new Date().toISOString(),
        }
      });

      // 4. Cleanup
      queryClient.invalidateQueries({ queryKey: ['jokes'] });
      resetShareIntent();
      Alert.alert("Success", "Saved to your database!");
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Share Intent Save Failed', error);
      Alert.alert("Error", "Failed to save shared content.");
    } finally {
      setIsUploading(false);
      setIsModerating(false);
      setUploadProgress(0);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#ff272a" />
      </View>
    );
  }

  if (!hasShareIntent) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <View className="w-20 h-20 bg-muted rounded-full items-center justify-center mb-4">
          <FontAwesome name="share-alt" size={32} color="#949494" />
        </View>
        <Text className="text-xl font-bold text-foreground text-center">No content shared</Text>
        <Text className="text-muted-foreground text-center mt-2 font-medium">
          Share a photo or video from another app to see it here!
        </Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')}
          className="mt-8 bg-primary px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold text-lg">Go to App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-3xl font-bold text-foreground">Save Joke</Text>
            <Text className="text-muted-foreground font-medium">Adding to your funny collection</Text>
          </View>
          <TouchableOpacity onPress={() => { resetShareIntent(); router.replace('/(tabs)'); }}>
            <View className="w-10 h-10 bg-card rounded-full items-center justify-center border border-muted/20">
              <FontAwesome name="times" size={20} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View className="aspect-square bg-card rounded-[32px] overflow-hidden mb-8 border border-muted/20">
          {shareIntent.type === 'video' && player ? (
            <VideoView player={player} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <Image source={shareIntent.value} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          )}
        </View>

        {/* Status Indicators */}
        {(isModerating || isUploading) && (
          <View className="mb-8">
            <View className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <View 
                className="h-full bg-primary" 
                style={{ width: isModerating ? '30%' : `${uploadProgress * 100}%` }}
              />
            </View>
            <Text className="text-center text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest">
              {isModerating ? 'AI is checking safety...' : `Uploading: ${Math.round(uploadProgress * 100)}%`}
            </Text>
          </View>
        )}

        {/* Form */}
        <View className="space-y-4">
          <View className="mb-4">
            <Text className="text-sm font-bold text-foreground mb-2">Title</Text>
            <TextInput
              className="bg-card p-4 rounded-2xl text-foreground font-medium border border-muted/20"
              placeholder="Give it a title..."
              placeholderTextColor="#949494"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm font-bold text-foreground mb-2">Description (Optional)</Text>
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

          <View className="mb-8">
            <Text className="text-sm font-bold text-foreground mb-2">Tags</Text>
            <TextInput
              className="bg-card p-4 rounded-2xl text-foreground font-medium border border-muted/20"
              placeholder="meme, work, coding..."
              placeholderTextColor="#949494"
              value={tags}
              onChangeText={setTags}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isUploading || isModerating}
          activeOpacity={0.8}
          className={`py-5 rounded-[24px] items-center shadow-sm ${
            isUploading || isModerating ? 'bg-muted/50' : 'bg-primary'
          }`}
        >
          {isUploading || isModerating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save to Database</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
