import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';

const ServiceDetails = ({ navigation, route }) => {
  const { serviceId } = route.params || {};
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadServiceDetails();
    }
  }, [serviceId]);

  const loadServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getServiceById(serviceId);
      if (response.success) {
        setService(response.data.service);
      }
    } catch (error) {
      console.error('Load service details error:', error);
      Alert.alert('Error', 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async () => {
    try {
      setBookingLoading(true);
      
      const bookingData = {
        serviceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: 'Booking from mobile app'
      };

      const response = await ApiService.createBooking(serviceId, bookingData);
      if (response.success) {
        Alert.alert(
          'Booking Successful',
          'Your service has been booked successfully. The provider will contact you soon.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Book service error:', error);
      Alert.alert('Error', 'Failed to book service. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactProvider = async () => {
    try {
      const response = await ApiService.startChat(serviceId);
      if (response.success) {
        navigation.navigate('Chat', {
          conversationId: response.data.chat._id,
          clientName: service?.provider?.firstName + ' ' + service?.provider?.lastName
        });
      }
    } catch (error) {
      console.error('Start chat error:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'tailoring': 'shirt',
      'cooking': 'restaurant',
      'beauty-services': 'flower',
      'teaching': 'school',
      'arts-and-crafts': 'brush',
      'other': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const formatCategoryName = (category) => {
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
          style={styles.gradient}
        >
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#FB923C" />
            <Text style={styles.loadingText}>Loading Service...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
          style={styles.gradient}
        >
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Service not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Image */}
          <View style={styles.imageContainer}>
            {service.serviceImage ? (
              <Image 
                source={{ uri: service.serviceImage }} 
                style={styles.serviceImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name={getCategoryIcon(service.category)} size={48} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Service Info */}
          <View style={styles.contentContainer}>
            {/* Title and Price */}
            <View style={styles.titleSection}>
              <Text style={styles.serviceName}>{service.serviceName}</Text>
              <Text style={styles.servicePrice}>₹{service.price}</Text>
            </View>

            {/* Category Badge */}
            <View style={styles.categoryContainer}>
              <View style={styles.categoryBadge}>
                <Ionicons name={getCategoryIcon(service.category)} size={16} color="#6B46C1" />
                <Text style={styles.categoryText}>
                  {formatCategoryName(service.category)}
                </Text>
              </View>
              
              {service.isActive ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Available</Text>
                </View>
              ) : (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveText}>Unavailable</Text>
                </View>
              )}
            </View>

            {/* Provider Info */}
            <View style={styles.providerSection}>
              <Text style={styles.sectionTitle}>Service Provider</Text>
              <View style={styles.providerCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.providerGradient}
                >
                  <View style={styles.providerAvatar}>
                    <LinearGradient
                      colors={['#FB923C', '#6B46C1']}
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.avatarText}>
                        {service.provider?.firstName?.charAt(0)}{service.provider?.lastName?.charAt(0)}
                      </Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>
                      {service.provider?.firstName} {service.provider?.lastName}
                    </Text>
                    <Text style={styles.providerEmail}>{service.provider?.email}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>4.8 (24 reviews)</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>{service.description}</Text>
              </View>
            </View>

            {/* Service Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>What's Included</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Professional service delivery</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Quality materials included</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Satisfaction guarantee</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.featureText}>Post-service support</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContactProvider}
          >
            <Ionicons name="chatbubble" size={20} color="#6B46C1" />
            <Text style={styles.contactButtonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bookButton, !service.isActive && styles.disabledButton]}
            onPress={handleBookService}
            disabled={!service.isActive || bookingLoading}
          >
            <LinearGradient
              colors={service.isActive ? ['#FB923C', '#6B46C1'] : ['#D1D5DB', '#D1D5DB']}
              style={styles.bookGradient}
            >
              {bookingLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="calendar" size={20} color="white" />
                  <Text style={styles.bookButtonText}>
                    {service.isActive ? 'Book Service' : 'Unavailable'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 16,
  },
  servicePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FB923C',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B46C1',
    marginLeft: 6,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  inactiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  providerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  providerCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  providerGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  providerAvatar: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  providerEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresList: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.3)',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B46C1',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B46C1',
  },
  bookButton: {
    flex: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ServiceDetails;
