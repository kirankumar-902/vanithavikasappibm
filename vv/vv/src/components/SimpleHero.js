import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';

const SimpleHero = ({ onGetStarted, onLogin }) => {
  return (
    <LinearGradient
      colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/app-logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Vanitha Vikas</Text>
          <Text style={styles.subtitle}>
            Empowering Women Through Skills & Services
          </Text>
        </View>

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
            <Text style={styles.gradientText}>Talented Women</Text>
          </Text>
          <Text style={styles.description}>
            Discover amazing services from skilled women in your community. 
            From tailoring to teaching, cooking to crafts - find the perfect service provider.
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onGetStarted} style={styles.primaryButton}>
            <LinearGradient
              colors={['#FB923C', '#6B46C1']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogin} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Service Providers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10k+</Text>
              <Text style={styles.statLabel}>Happy Customers</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 56,
    height: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 16,
  },
  animationContainer: {
    width: 320,
    height: 256,
    alignSelf: 'center',
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
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 24,
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 48,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 16,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FB923C',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FB923C',
  },
  statsContainer: {
    paddingHorizontal: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default SimpleHero;
