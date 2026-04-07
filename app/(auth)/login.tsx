import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
  const { signInWithGoogle, isLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is logged in the hook
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <View className="items-center mb-12">
        <View className="w-20 h-20 bg-yellow-400 rounded-3xl items-center justify-center mb-4 transform rotate-12">
          <FontAwesome name="laugh-beam" size={40} color="black" />
        </View>
        <Text className="text-4xl font-bold text-gray-900">Laughly</Text>
        <Text className="text-gray-500 mt-2 text-center text-lg">
          Your personal joke database.{"\n"}Save the funny, share the joy.
        </Text>
      </View>

      <View className="space-y-4">
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          className="flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-xl px-4 shadow-sm"
        >
          <FontAwesome name="google" size={20} color="#EA4335" />
          <Text className="text-gray-900 font-semibold ml-3 text-lg">
            Sign in with Google
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center text-gray-400 mt-12 text-sm px-8">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );
}
