import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Hero = ({ onGetStarted, onLearnMore }) => {
  return (
    <LinearGradient
      colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
      style={{ flex: 1, minHeight: height }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header Section */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-full mb-4 items-center justify-center"
                  style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }}>
              <Ionicons name="heart" size={32} color="#FB923C" />
            </View>
            <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
              Vanitha Vikas
            </Text>
            <Text className="text-lg text-center text-gray-600 px-4">
              Empowering Women Through Skills & Services
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Lottie Animation */}
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../assets/Woman Working on Laptop in Office.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>

            {/* Hero Text */}
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>
                Connect with{' '}
                <Text style={styles.gradientText}>
                  Talented Women
                </Text>
              </Text>
              <Text className="text-lg text-center text-gray-600 px-6 leading-relaxed">
                Discover amazing services from skilled women in your community. 
                From tailoring to teaching, cooking to crafts - find the perfect service provider.
              </Text>
            </View>

            {/* CTA Buttons */}
            <View className="w-full px-4 space-y-4">
              <TouchableOpacity
                onPress={onGetStarted}
                className="w-full py-4 rounded-2xl items-center shadow-lg"
              >
                <LinearGradient
                  colors={['#FB923C', '#6B46C1']}
                  style={{
                    width: '100%',
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center'
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text className="text-white text-lg font-semibold mr-2">
                    Get Started
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onLearnMore}
                className="w-full py-4 rounded-2xl border-2 items-center"
                style={{ borderColor: '#FB923C', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <Text className="text-lg font-semibold" style={{ color: '#FB923C' }}>
                  Learn More
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Section */}
          <View className="mt-12 px-4">
            <View className="bg-white/80 rounded-2xl p-6 shadow-lg backdrop-blur-md">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-800">500+</Text>
                  <Text className="text-sm text-gray-600">Service Providers</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-800">50+</Text>
                  <Text className="text-sm text-gray-600">Cities</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-800">10k+</Text>
                  <Text className="text-sm text-gray-600">Happy Customers</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: 320,
    height: 256,
    marginBottom: 32,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  heroTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  gradientText: {
    color: '#FB923C',
  },
});

export default Hero;
