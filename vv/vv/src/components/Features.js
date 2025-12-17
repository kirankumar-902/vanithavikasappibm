import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Features = () => {
  const features = [
    {
      id: 1,
      title: 'Verified Providers',
      description: 'All service providers are thoroughly verified for quality and reliability',
      icon: 'shield-checkmark-outline',
      gradient: ['#10B981', '#059669']
    },
    {
      id: 2,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options',
      icon: 'card-outline',
      gradient: ['#3B82F6', '#2563EB']
    },
    {
      id: 3,
      title: 'Real-time Chat',
      description: 'Communicate directly with service providers through our chat system',
      icon: 'chatbubbles-outline',
      gradient: ['#EC4899', '#DB2777']
    },
    {
      id: 4,
      title: 'Location Based',
      description: 'Find services near you with our smart location-based matching',
      icon: 'location-outline',
      gradient: ['#F59E0B', '#D97706']
    }
  ];

  return (
    <View className="py-16 px-6">
      {/* Header */}
      <View className="items-center mb-12">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-4">
          Why Choose Us?
        </Text>
        <Text className="text-lg text-center text-gray-600 px-4">
          We provide the best platform for connecting with skilled women professionals
        </Text>
      </View>

      {/* Features Grid */}
      <View className="space-y-6">
        {features.map((feature, index) => (
          <View
            key={feature.id}
            className="bg-white/80 rounded-2xl p-6 shadow-lg backdrop-blur-md"
            style={{
              flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
              alignItems: 'center'
            }}
          >
            {/* Icon */}
            <View className="w-20 h-20 rounded-2xl items-center justify-center mr-4">
              <LinearGradient
                colors={feature.gradient}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={feature.icon} size={32} color="white" />
              </LinearGradient>
            </View>

            {/* Content */}
            <View className="flex-1" style={{ marginRight: index % 2 === 0 ? 0 : 16, marginLeft: index % 2 === 0 ? 16 : 0 }}>
              <Text className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </Text>
              <Text className="text-gray-600 leading-relaxed">
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Features;
