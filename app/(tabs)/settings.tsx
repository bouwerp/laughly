import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useJokes } from '../../hooks/useJokes';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const { jokes } = useJokes();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of Laughly?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: () => signOut() 
        }
      ]
    );
  };

  const stats = [
    { label: 'Total Jokes', value: jokes?.length || 0, icon: 'archive' },
    { label: 'Favorites', value: jokes?.filter(j => j.isFavorite).length || 0, icon: 'heart' },
    { label: 'Account', value: 'Google', icon: 'google' },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <Stack.Screen options={{ 
        title: 'Profile',
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: 'bold' }
      }} />

      <View className="p-6">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="relative">
            <Image
              source={session?.user?.avatarUrl || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FNorth%20American%2F4"}
              style={{ width: 100, height: 100, borderRadius: 50 }}
              className="border-4 border-white shadow-sm"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <FontAwesome name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-foreground mt-4">{session?.user?.name || 'Test User'}</Text>
          <Text className="text-muted-foreground font-medium">{session?.user?.email || 'test@example.com'}</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          {stats.map((stat) => (
            <View key={stat.label} className="w-[31%] bg-card p-4 rounded-2xl items-center border border-muted/20">
              <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center mb-2">
                <FontAwesome name={stat.icon as any} size={18} color="#ff272a" />
              </View>
              <Text className="text-lg font-bold text-foreground">{stat.value}</Text>
              <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight text-center">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View className="bg-card rounded-3xl border border-muted/20 overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-muted/10">
            <View className="flex-row items-center">
              <View className="w-9 h-9 bg-muted/30 rounded-full items-center justify-center mr-3">
                <FontAwesome name="user" size={18} color="#000" />
              </View>
              <Text className="text-foreground font-bold">Edit Profile</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#949494" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-muted/10">
            <View className="flex-row items-center">
              <View className="w-9 h-9 bg-muted/30 rounded-full items-center justify-center mr-3">
                <FontAwesome name="shield" size={18} color="#000" />
              </View>
              <Text className="text-foreground font-bold">Privacy & Security</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#949494" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-9 h-9 bg-muted/30 rounded-full items-center justify-center mr-3">
                <FontAwesome name="bell" size={18} color="#000" />
              </View>
              <Text className="text-foreground font-bold">Notifications</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#949494" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.7}
          className="bg-secondary p-4 rounded-2xl flex-row items-center justify-center border border-primary/20"
        >
          <FontAwesome name="sign-out" size={18} color="#ff272a" />
          <Text className="text-primary font-bold ml-2 text-base">Sign Out</Text>
        </TouchableOpacity>

        <View className="mt-8 items-center">
          <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Laughly v1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}
