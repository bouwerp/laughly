import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useJokes } from '../../hooks/useJokes';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';

export default function Settings() {
  const { session, signOut } = useAuth();
  const { jokes } = useJokes();

  const handleSignOut = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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

  const favoriteCount = jokes?.filter(j => j.isFavorite).length || 0;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Profile' }} />
      
      {/* Profile Header */}
      <View className="bg-white p-8 items-center border-b border-gray-100">
        <View className="w-24 h-24 bg-yellow-400 rounded-full items-center justify-center mb-4 shadow-sm">
          {session?.user?.avatarUrl ? (
            <Image 
              source={{ uri: session.user.avatarUrl }} 
              className="w-full h-full rounded-full"
            />
          ) : (
            <FontAwesome name="user" size={40} color="black" />
          )}
        </View>
        <Text className="text-2xl font-bold text-gray-900">{session?.user?.name || 'User'}</Text>
        <Text className="text-gray-500 mt-1">{session?.user?.email}</Text>
      </View>

      {/* Stats */}
      <View className="flex-row bg-white mt-4 py-6 border-y border-gray-100">
        <View className="flex-1 items-center border-r border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">{jokes?.length || 0}</Text>
          <Text className="text-gray-500 text-xs uppercase font-semibold">Total Jokes</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-red-500">{favoriteCount}</Text>
          <Text className="text-gray-500 text-xs uppercase font-semibold">Favorites</Text>
        </View>
      </View>

      {/* Menu */}
      <View className="mt-6">
        <Text className="px-6 text-gray-400 text-xs uppercase font-bold mb-2">Account</Text>
        <View className="bg-white border-y border-gray-100">
          <TouchableOpacity 
            onPress={handleSignOut}
            className="flex-row items-center px-6 py-4"
          >
            <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-4">
              <FontAwesome name="sign-out" size={16} color="#EF4444" />
            </View>
            <Text className="flex-1 text-red-500 font-semibold text-lg">Sign Out</Text>
            <FontAwesome name="angle-right" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View className="mt-12 items-center pb-12">
        <Text className="text-gray-300 font-bold tracking-widest uppercase text-[10px]">Laughly v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
