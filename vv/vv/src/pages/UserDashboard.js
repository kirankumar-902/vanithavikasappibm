import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';

const UserDashboard = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Delay dashboard load to ensure app is fully mounted
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load categories first (public endpoint)
      const categoriesResponse = await ApiService.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories);
      }
      
      // Load services (public endpoint)
      const servicesResponse = await ApiService.getServices({ limit: 6 });
      if (servicesResponse.success) {
        setServices(servicesResponse.data.services);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Load categories first (public endpoint)
      const categoriesResponse = await ApiService.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories);
      }
      
      // Load services (public endpoint)
      const servicesResponse = await ApiService.getServices({ limit: 6 });
      if (servicesResponse.success) {
        setServices(servicesResponse.data.services);
      }
    } catch (error) {
      console.error('Dashboard refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#FB923C', '#6B46C1']}
              tintColor="#FB923C"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome to Vanitha Vikas!</Text>
              <Text style={styles.subtitle}>Empowering Women Through Services</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color="#6B46C1" />
            </TouchableOpacity>
          </View>

          {/* About Vanitha Vikas */}
          <View style={styles.aboutContainer}>
            <LinearGradient
              colors={['#FB923C', '#6B46C1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aboutGradient}
            >
              <View style={styles.aboutContent}>
                <Ionicons name="heart" size={32} color="white" style={styles.aboutIcon} />
                <Text style={styles.aboutTitle}>About Vanitha Vikas</Text>
                <Text style={styles.aboutDescription}>
                  Vanitha Vikas is a platform dedicated to empowering women by connecting them with essential services and opportunities. We bridge the gap between service providers and seekers, creating a supportive community for women's growth and development.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* How to Use */}
          <View style={styles.guideContainer}>
            <Text style={styles.sectionTitle}>How to Use Vanitha Vikas</Text>
            
            <View style={styles.stepContainer}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Browse Services</Text>
                  <Text style={styles.stepDescription}>Explore various services available in your area through the Services tab</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Find by Category</Text>
                  <Text style={styles.stepDescription}>Use Categories tab to find services organized by type and specialty</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Connect & Chat</Text>
                  <Text style={styles.stepDescription}>Message service providers directly through the Chats tab</Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Manage Profile</Text>
                  <Text style={styles.stepDescription}>Update your profile and preferences in the Profile tab</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Platform Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FB923C', '#F97316']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="people" size={24} color="white" />
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>Women Providers</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#6B46C1', '#8B5CF6']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="briefcase" size={24} color="white" />
                <Text style={styles.statNumber}>1000+</Text>
                <Text style={styles.statLabel}>Services</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="star" size={24} color="white" />
                <Text style={styles.statNumber}>4.8</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.featureIconGradient}
                  >
                    <Ionicons name="shield-checkmark" size={20} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Verified Providers</Text>
                  <Text style={styles.featureDescription}>All service providers are verified for quality and reliability</Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <LinearGradient
                    colors={['#6B46C1', '#EC4899']}
                    style={styles.featureIconGradient}
                  >
                    <Ionicons name="location" size={20} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Local Services</Text>
                  <Text style={styles.featureDescription}>Find services in your local area with location-based search</Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <LinearGradient
                    colors={['#EC4899', '#FB923C']}
                    style={styles.featureIconGradient}
                  >
                    <Ionicons name="chatbubbles" size={20} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Direct Communication</Text>
                  <Text style={styles.featureDescription}>Chat directly with service providers to discuss your needs</Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <LinearGradient
                    colors={['#10B981', '#3B82F6']}
                    style={styles.featureIconGradient}
                  >
                    <Ionicons name="trending-up" size={20} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Women Empowerment</Text>
                  <Text style={styles.featureDescription}>Supporting women entrepreneurs and service providers</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Get Started */}
          <View style={styles.getStartedContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.getStartedGradient}
            >
              <Ionicons name="rocket" size={32} color="#FB923C" />
              <Text style={styles.getStartedTitle}>Ready to Get Started?</Text>
              <Text style={styles.getStartedDescription}>
                Explore our tabs to find services, browse categories, chat with providers, and manage your profile.
              </Text>
              <View style={styles.getStartedButtons}>
                <TouchableOpacity 
                  style={styles.getStartedButton}
                  onPress={() => navigation.navigate('Services')}
                >
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.getStartedButtonGradient}
                  >
                    <Text style={styles.getStartedButtonText}>Browse Services</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.getStartedButton}
                  onPress={() => navigation.navigate('Categories')}
                >
                  <LinearGradient
                    colors={['#6B46C1', '#EC4899']}
                    style={styles.getStartedButtonGradient}
                  >
                    <Text style={styles.getStartedButtonText}>View Categories</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  aboutGradient: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  aboutContent: {
    alignItems: 'center',
  },
  aboutIcon: {
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  aboutDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
  },
  guideContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  stepContainer: {
    marginTop: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FB923C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featuresList: {
    marginTop: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  getStartedContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  getStartedGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  getStartedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  getStartedDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  getStartedButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  getStartedButton: {
    flex: 1,
  },
  getStartedButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default UserDashboard;
