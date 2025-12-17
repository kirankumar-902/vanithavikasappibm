import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList, Image, Linking, Alert, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';
import { SkeletonLoader } from '../components/LoadingScreen';

const Services = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState(route?.params?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || '');
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]); // Store all services for frontend filtering
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchTimeout, setLocationSearchTimeout] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (route?.params?.search) {
      setSearchQuery(route.params.search);
      searchServices(route.params.search);
    }
    if (route?.params?.category) {
      setSelectedCategory(route.params.category);
      filterByCategory(route.params.category);
    }
  }, [route?.params]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading services with backend filtering');
      
      // Build filters for backend API call
      const filters = {
        limit: 100,
        search: searchQuery,
        category: selectedCategory
      };
      
      // Add location filter if present
      if (locationSearchQuery && locationSearchQuery.trim()) {
        filters.location = locationSearchQuery.trim();
      }
      
      const [servicesResponse, categoriesResponse] = await Promise.all([
        ApiService.getServices(filters),
        ApiService.getCategories()
      ]);

      console.log('LoadData API response:', servicesResponse);
      if (servicesResponse.success) {
        console.log('Loaded services count:', servicesResponse.data.services.length);
        setAllServices(servicesResponse.data.services);
        setServices(servicesResponse.data.services); // Set services directly since backend filtering is applied
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger new API call when filters change
  const applyFilters = async () => {
    try {
      setLoading(true);
      console.log('Applying filters with backend API call');
      
      // Build filters for backend API call
      const filters = {
        limit: 100,
        search: searchQuery,
        category: selectedCategory
      };
      
      // Add location filter if present (even for short inputs)
      if (locationSearchQuery && locationSearchQuery.trim().length >= 2) {
        filters.location = locationSearchQuery.trim();
      }
      
      const response = await ApiService.getServices(filters);
      
      if (response.success) {
        console.log('Filtered services count:', response.data.services.length);
        setAllServices(response.data.services);
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Apply filters error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced location search for real-time filtering
  const handleLocationSearch = (text) => {
    setLocationSearchQuery(text);
    
    // Clear existing timeout
    if (locationSearchTimeout) {
      clearTimeout(locationSearchTimeout);
    }
    
    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      if (text.trim().length >= 2 || text.trim().length === 0) {
        applyFilters();
      }
    }, 500); // 500ms delay
    
    setLocationSearchTimeout(newTimeout);
  };

  const searchServices = async (query = searchQuery) => {
    setSearchQuery(query);
    await applyFilters();
  };

  const filterByCategory = async (category) => {
    setSelectedCategory(category);
    await applyFilters();
  };

  const handleCategorySelect = (category) => {
    const newCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(newCategory);
    filterByCategory(newCategory);
  };


  const clearLocationFilter = () => {
    setLocationSearchQuery('');
    applyFilters();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not available');
      return;
    }
    
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl)
      .catch((error) => {
        console.error('Call error:', error);
        Alert.alert('Error', 'Failed to make call');
      });
  };

  const handleChat = async (serviceId) => {
    try {
      console.log('Starting chat for service:', serviceId);
      const response = await ApiService.startChat(serviceId);
      
      if (response.success) {
        navigation.navigate('Chat', { 
          chatId: response.data.chat._id,
          serviceName: response.data.chat.service?.serviceName 
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', error.message || 'Failed to start chat');
    }
  };

  const renderServiceCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => handleChat(item._id)}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.serviceGradient}
      >
        {item.serviceImage && (
          <Image source={{ uri: item.serviceImage }} style={styles.serviceImage} />
        )}
        
        <View style={styles.serviceContent}>
          <View style={styles.serviceHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            <Text style={styles.servicePrice}>₹{item.price}</Text>
          </View>
          
          <Text style={styles.serviceName} numberOfLines={2}>{item.serviceName}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.providerInfo}>
            <View style={styles.providerAvatar}>
              <LinearGradient
                colors={['#FB923C', '#6B46C1']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {item.provider?.firstName?.charAt(0)}{item.provider?.lastName?.charAt(0)}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>
                {item.provider?.firstName} {item.provider?.lastName}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <Text style={styles.locationText}>
                  {item.serviceLocation || `${item.location?.city}, ${item.location?.state}`}
                </Text>
              </View>
              {item.phoneNumber && (
                <View style={styles.locationRow}>
                  <Ionicons name="call-outline" size={12} color="#6B7280" />
                  <Text style={styles.locationText}>
                    {item.phoneNumber}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => handleChat(item._id)}
            >
              <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Services</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={clearLocationFilter}
          >
            <Ionicons name="location-outline" size={24} color="#1F2937" />
            {locationSearchQuery && (
              <View style={styles.filterIndicator} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bars */}
        <View style={styles.searchContainer}>
          {/* Service Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
              }}
              onEndEditing={() => applyFilters()}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                applyFilters();
              }}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Location Search */}
          <View style={[styles.searchBar, { marginTop: 12 }]}>
            <Ionicons name="location" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter location (e.g., Kad, Bang, Mum...)"
              value={locationSearchQuery}
              onChangeText={handleLocationSearch}
              placeholderTextColor="#9CA3AF"
            />
            {locationSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setLocationSearchQuery('');
                applyFilters();
              }}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity 
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => handleCategorySelect('')}
            >
              <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.categoryChip, selectedCategory === category.name && styles.categoryChipActive]}
                onPress={() => handleCategorySelect(category.name)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === category.name && styles.categoryChipTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Services List */}
        {loading ? (
          <SkeletonLoader type="list" />
        ) : (
          <FlatList
            data={services}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.servicesList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FB923C']}
                tintColor="#FB923C"
                title="Pull to refresh"
                titleColor="#6B7280"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Services Found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            }
          />
        )}

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FB923C',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingLeft: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  servicesList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  serviceCard: {
    marginBottom: 16,
  },
  serviceGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  serviceImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B46C1',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FB923C',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '80%',
  },
  modalGradient: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationSearchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  locationSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationSearchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  currentLocationContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  currentLocationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  currentLocationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  currentLocationText: {
    fontSize: 14,
    color: '#FB923C',
    fontWeight: '500',
    flex: 1,
  },
  locationSuggestions: {
    maxHeight: 300,
    paddingHorizontal: 24,
  },
  locationSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  locationSuggestionContent: {
    flex: 1,
  },
  locationSuggestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationSuggestionSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  noSuggestionsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSuggestionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  noSuggestionsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalActions: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});

export default Services;
