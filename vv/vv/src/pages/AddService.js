import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import LocationService from '../services/locationService';
import ApiService from '../services/api';

const AddService = ({ navigation, route }) => {
  const editingService = route?.params?.service;
  const isEditing = !!editingService;

  const [formData, setFormData] = useState({
    serviceName: '',
    category: '',
    customCategory: '',
    price: '',
    description: '',
    location: '',
    phoneNumber: '',
    serviceImage: null
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const categories = [
    { label: 'Dance', value: 'Dance' },
    { label: 'Home Tutoring', value: 'Home Tutoring' },
    { label: 'Home Maid', value: 'Home Maid' },
    { label: 'Tailoring', value: 'Tailoring' },
    { label: 'Home Food', value: 'Home Food' },
    { label: 'Embroidery', value: 'Embroidery' },
    { label: 'Beauty', value: 'Beauty' },
    { label: 'Mehendi', value: 'Mehendi' },
    { label: 'Yoga & Fitness', value: 'Yoga & Fitness' },
    { label: 'Childcare', value: 'Childcare' },
    { label: 'Handicrafts', value: 'Handicrafts' },
    { label: 'Event Decoration', value: 'Event Decoration' },
    { label: 'Hair Styling', value: 'Hair Styling' },
    { label: 'Baking', value: 'Baking' },
    { label: 'Music Lessons', value: 'Music Lessons' },
    { label: 'Other', value: 'other' }
  ];

  useEffect(() => {
    if (isEditing && editingService) {
      setFormData({
        serviceName: editingService.serviceName || '',
        category: editingService.category || '',
        customCategory: editingService.customCategory || '',
        price: editingService.price?.toString() || '',
        description: editingService.description || '',
        location: editingService.serviceLocation || '',
        phoneNumber: editingService.phoneNumber || '',
        serviceImage: editingService.serviceImage || null
      });
    }
  }, [isEditing, editingService]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Handle location search with Geoapify
    if (field === 'location' && value.length > 2) {
      searchLocations(value);
    } else if (field === 'location' && value.length <= 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }
  };

  const searchLocations = async (query) => {
    try {
      setLocationLoading(true);
      const result = await LocationService.searchLocationSuggestions(query);
      
      if (result.success && result.suggestions) {
        setLocationSuggestions(result.suggestions);
        setShowLocationDropdown(true);
      } else {
        console.error('Location search error:', result.error);
        setLocationSuggestions([]);
        setShowLocationDropdown(false);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const selectLocation = (location) => {
    const selectedLocationText = location.formatted || location.properties?.formatted || location.text;
    setFormData(prev => ({
      ...prev,
      location: selectedLocationText
    }));
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      const result = await LocationService.getCurrentLocation({
        accuracy: 'balanced',
        timeout: 15000,
        maximumAge: 10000,
      });
      
      if (result.success) {
        const { latitude, longitude } = result.location;
        
        // Get location details via API
        const locationResult = await LocationService.searchLocationSuggestions(`${latitude},${longitude}`);
        
        if (locationResult.success && locationResult.suggestions.length > 0) {
          const locationData = locationResult.suggestions[0];
          setFormData(prev => ({
            ...prev,
            location: locationData.formatted
          }));
          Alert.alert('Success', 'Current location set successfully!');
        } else {
          // Fallback: just use coordinates
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
          Alert.alert('Success', 'Location coordinates set successfully!');
        }
      } else {
        LocationService.showLocationErrorAlert(result, {
          title: 'Get Current Location Failed',
          onRetry: () => handleGetCurrentLocation(),
          onCancel: () => {}
        });
      }
    } catch (error) {
      console.error('Get current location error:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUploading(true);
        try {
          const uploadResponse = await ApiService.uploadServiceImage(result.assets[0]);
          if (uploadResponse.success) {
            handleInputChange('serviceImage', uploadResponse.data.imageUrl);
            Alert.alert('Success', 'Image uploaded successfully');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setImageUploading(false);
        }
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image');
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.serviceName.trim()) {
      Alert.alert('Validation Error', 'Please enter service name');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }
    if (formData.category === 'other' && !formData.customCategory.trim()) {
      Alert.alert('Validation Error', 'Please enter custom category name');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Please enter service location');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter phone number');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit Indian phone number');
      return false;
    }
    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter service description');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const serviceData = {
        serviceName: formData.serviceName.trim(),
        category: formData.category === 'other' ? formData.customCategory.trim() : formData.category,
        customCategory: formData.category === 'other' ? formData.customCategory.trim() : null,
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        location: formData.location.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        serviceImage: formData.serviceImage
      };

      let response;
      if (isEditing) {
        response = await ApiService.updateService(editingService._id, serviceData);
      } else {
        response = await ApiService.createService(serviceData);
      }

      if (response.success) {
        Alert.alert(
          'Success', 
          `Service ${isEditing ? 'updated' : 'created'} successfully`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Submit service error:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} service`);
    } finally {
      setLoading(false);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Service' : 'Add Service'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Service Image */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Service Image</Text>
              <TouchableOpacity 
                style={styles.imageUploadContainer}
                onPress={pickImage}
                disabled={imageUploading}
              >
                {formData.serviceImage ? (
                  <Image 
                    source={{ uri: formData.serviceImage }} 
                    style={styles.uploadedImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    {imageUploading ? (
                      <ActivityIndicator size="large" color="#FB923C" />
                    ) : (
                      <>
                        <Ionicons name="camera" size={48} color="#9CA3AF" />
                        <Text style={styles.imagePlaceholderText}>Tap to upload image</Text>
                      </>
                    )}
                  </View>
                )}
                {formData.serviceImage && (
                  <View style={styles.imageOverlay}>
                    <Ionicons name="camera" size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Service Name */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Service Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter service name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.serviceName}
                  onChangeText={(value) => handleInputChange('serviceName', value)}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryButton,
                      formData.category === category.value && styles.categoryButtonActive
                    ]}
                    onPress={() => handleInputChange('category', category.value)}
                  >
                    <Text style={[
                      styles.categoryText,
                      formData.category === category.value && styles.categoryTextActive
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {formData.category === 'other' && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter custom category"
                    placeholderTextColor="#9CA3AF"
                    value={formData.customCategory}
                    onChangeText={(value) => handleInputChange('customCategory', value)}
                  />
                </View>
              )}
            </View>

            {/* Location */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Service Location *</Text>
              <View style={styles.locationInputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="location" size={20} color="#FB923C" style={styles.locationIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter service location (city, area)"
                    placeholderTextColor="#9CA3AF"
                    value={formData.location}
                    onChangeText={(value) => handleInputChange('location', value)}
                  />
                  {locationLoading && (
                    <ActivityIndicator size="small" color="#FB923C" style={styles.locationLoader} />
                  )}
                  <TouchableOpacity 
                    onPress={handleGetCurrentLocation}
                    style={styles.currentLocationButton}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#FB923C" />
                    ) : (
                      <Ionicons name="navigate" size={16} color="#FB923C" />
                    )}
                  </TouchableOpacity>
                </View>
                
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <View style={styles.locationDropdown}>
                    {locationSuggestions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.locationSuggestion}
                        onPress={() => selectLocation(item)}
                      >
                        <Ionicons name="location-outline" size={16} color="#6B7280" />
                        <Text style={styles.locationSuggestionText}>
                          {item.formatted || item.properties?.formatted || item.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color="#FB923C" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Price (₹) *</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={[styles.textInput, styles.priceInput]}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe your service in detail..."
                  placeholderTextColor="#9CA3AF"
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FB923C', '#6B46C1']}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons 
                      name={isEditing ? "checkmark" : "add"} 
                      size={20} 
                      color="white" 
                    />
                    <Text style={styles.submitText}>
                      {isEditing ? 'Update Service' : 'Create Service'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  imageUploadContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '500',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
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
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FB923C',
    marginRight: 8,
  },
  priceInput: {
    textAlign: 'left',
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInputWrapper: {
    position: 'relative',
  },
  locationLoader: {
    marginLeft: 8,
  },
  currentLocationButton: {
    marginLeft: 8,
    padding: 4,
  },
  locationDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 200,
  },
  locationList: {
    maxHeight: 200,
  },
  locationSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationSuggestionText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.5)',
    marginRight: 12,
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
  submitButton: {
    marginTop: 12,
    marginBottom: 16,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});

export default AddService;
