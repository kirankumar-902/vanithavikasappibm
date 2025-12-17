import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Footer = () => {
  const handleSocialPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <LinearGradient
      colors={['#6B46C1', '#4C1D95']}
      style={{ paddingVertical: 48, paddingHorizontal: 24 }}
    >
      <View className="items-center">
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full mb-4 items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <Ionicons name="heart" size={32} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">
            Vanitha Vikas
          </Text>
          <Text className="text-white/80 text-center px-4">
            Empowering Women Through Skills & Services
          </Text>
        </View>

        {/* Quick Links */}
        <View className="w-full mb-8">
          <Text className="text-white font-semibold text-lg mb-4 text-center">
            Quick Links
          </Text>
          <View className="flex-row flex-wrap justify-center space-x-6">
            <TouchableOpacity className="mb-2">
              <Text className="text-white/80">About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mb-2">
              <Text className="text-white/80">Services</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mb-2">
              <Text className="text-white/80">Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mb-2">
              <Text className="text-white/80">Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Links */}
        <View className="mb-8">
          <Text className="text-white font-semibold text-lg mb-4 text-center">
            Follow Us
          </Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => handleSocialPress('https://facebook.com')}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Ionicons name="logo-facebook" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSocialPress('https://instagram.com')}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Ionicons name="logo-instagram" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSocialPress('https://twitter.com')}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Ionicons name="logo-twitter" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <View className="border-t border-white/20 pt-6 w-full">
          <Text className="text-white/60 text-center text-sm">
            © 2024 Vanitha Vikas. All rights reserved.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Footer;
