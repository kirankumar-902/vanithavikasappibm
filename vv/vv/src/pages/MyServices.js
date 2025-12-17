import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';

const MyServices = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadServices();
    });
    return unsubscribe;
  }, [navigation]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getProviderServices();
      if (response.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Load services error:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleDeleteService = (serviceId) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteService(serviceId)
        }
      ]
    );
  };

  const deleteService = async (serviceId) => {
    try {
      const response = await ApiService.deleteService(serviceId);
      if (response.success) {
        setServices(services.filter(s => s._id !== serviceId));
        Alert.alert('Success', 'Service deleted successfully');
      }
    } catch (error) {
      console.error('Delete service error:', error);
      Alert.alert('Error', 'Failed to delete service');
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const response = await ApiService.updateServiceStatus(serviceId, !currentStatus);
      if (response.success) {
        setServices(services.map(s => 
          s._id === serviceId ? { ...s, isActive: !currentStatus } : s
        ));
        Alert.alert('Success', `Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Toggle service status error:', error);
      Alert.alert('Error', 'Failed to update service status');
    }
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
            <Text style={styles.loadingText}>Loading Services...</Text>
          </View>
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
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Services</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddService')}
          >
            <Ionicons name="add" size={24} color="#FB923C" />
          </TouchableOpacity>
        </View>


        {/* Services List */}
        <ScrollView 
          style={styles.servicesContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        >
          {services.length > 0 ? (
            services.map((service, index) => (
              <ServiceCard
                key={service._id || index}
                service={service}
                onEdit={() => navigation.navigate('AddService', { service })}
                onDelete={() => handleDeleteService(service._id)}
                onToggleStatus={() => toggleServiceStatus(service._id, service.isActive)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>
                No services yet
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Add your first service to get started
              </Text>
                <TouchableOpacity 
                  style={styles.addFirstServiceButton}
                  onPress={() => navigation.navigate('AddService')}
                >
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.addFirstServiceGradient}
                  >
                    <Text style={styles.addFirstServiceText}>Add Service</Text>
                  </LinearGradient>
                </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const ServiceCard = ({ service, onEdit, onDelete, onToggleStatus }) => {
  return (
    <View style={styles.serviceCard}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.serviceGradient}
      >
        {/* Service Image */}
        {service.serviceImage && (
          <View style={styles.serviceImageContainer}>
            <Image 
              source={{ uri: service.serviceImage }} 
              style={styles.serviceImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.serviceContent}>
          {/* Service Header */}
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName} numberOfLines={2}>
              {service.serviceName}
            </Text>
            <Text style={styles.servicePrice}>₹{service.price}</Text>
          </View>

          {/* Category */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {service.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>

          {/* Location and Phone */}
          <View style={styles.serviceDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>
                {service.serviceLocation || 'Location not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>
                {service.phoneNumber || 'Phone not specified'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description}
          </Text>

          {/* Status and Date */}
          <View style={styles.serviceFooter}>
            <TouchableOpacity
              style={[
                styles.statusBadge,
                { backgroundColor: service.isActive ? '#D1FAE5' : '#FEE2E2' }
              ]}
              onPress={onToggleStatus}
            >
              <Text style={[
                styles.statusText,
                { color: service.isActive ? '#065F46' : '#991B1B' }
              ]}>
                {service.isActive ? 'Active' : 'Inactive'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.serviceDate}>
              {new Date(service.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.serviceActions}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Ionicons name="pencil" size={16} color="white" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="trash" size={16} color="white" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
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
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.5)',
  },
  categoryButtonActive: {
    backgroundColor: '#FB923C',
    borderColor: '#FB923C',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: 'white',
  },
  servicesContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  serviceCard: {
    marginBottom: 16,
  },
  serviceGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  serviceImageContainer: {
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FB923C',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B46C1',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  serviceDetails: {
    marginVertical: 8,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addFirstServiceButton: {
    width: 200,
  },
  addFirstServiceGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  addFirstServiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default MyServices;
