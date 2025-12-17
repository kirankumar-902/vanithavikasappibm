import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import LocationService from '../services/locationService';
import ApiService from '../services/api';
import { SkeletonLoader } from '../components/LoadingScreen';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearchText, setLocationSearchText] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    // Delay profile load to ensure app is fully mounted
    const timer = setTimeout(() => {
      loadUserProfile();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await ApiService.getUserProfile();
      if (response.success) {
        setUser(response.data.user);
        setEditedUser(response.data.user);
      }
    } catch (error) {
      console.error('Load profile error:', error);
      // Set default user data if profile load fails
      const defaultUser = {
        firstName: 'Guest',
        lastName: 'User',
        email: 'guest@example.com',
        phoneNumber: '',
        location: { city: '', state: '', fullAddress: '' }
      };
      setUser(defaultUser);
      setEditedUser(defaultUser);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfilePicture = async (imageAsset) => {
    try {
      setUploading(true);
      const response = await ApiService.uploadProfilePicture(imageAsset);
      
      if (response.success) {
        setUser(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
        setEditedUser(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const searchLocationSuggestions = async (text) => {
    if (text.length < 3) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      const result = await LocationService.searchLocationSuggestions(text);
      
      if (result.success) {
        setLocationSuggestions(result.suggestions || []);
        setShowLocationDropdown(result.suggestions?.length > 0);
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
      setSearchLoading(false);
    }
  };

  const handleLocationTextChange = (text) => {
    setLocationSearchText(text);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (text.length === 0) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      setSearchLoading(false);
      // Clear location data when text is empty
      setEditedUser(prev => ({
        ...prev,
        location: {
          city: '',
          state: '',
          country: '',
          formatted: '',
          fullAddress: '',
          latitude: null,
          longitude: null
        }
      }));
    } else {
      // Debounce search to prevent too many API calls
      const timeout = setTimeout(() => {
        searchLocationSuggestions(text);
      }, 500); // Wait 500ms after user stops typing
      
      setSearchTimeout(timeout);
    }
  };

  const selectLocationSuggestion = (suggestion) => {
    setLocationSearchText(suggestion.formatted);
    setEditedUser(prev => ({
      ...prev,
      location: {
        city: suggestion.city || '',
        state: suggestion.state || '',
        country: suggestion.country || 'India',
        formatted: suggestion.formatted,
        fullAddress: suggestion.formatted,
        latitude: suggestion.lat,
        longitude: suggestion.lon
      }
    }));
    setLocationSuggestions([]);
    setShowLocationDropdown(false);
  };

  const handleUpdateLocation = async () => {
    try {
      setLocationLoading(true);
      
      const result = await LocationService.getCurrentLocationAndUpdate({
        accuracy: 'balanced',
        timeout: 15000,
        maximumAge: 10000,
      });
      
      if (result.success) {
        setUser(result.userData.user);
        setEditedUser(result.userData.user);
        Alert.alert('Success', result.message || 'Location updated successfully!');
      } else {
        LocationService.showLocationErrorAlert(result, {
          title: 'Location Update Failed',
          onRetry: () => handleUpdateLocation(),
          onCancel: () => {}
        });
      }
    } catch (error) {
      console.error('Location update error:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      const result = await LocationService.getCurrentLocationAndUpdate();
      
      if (result.success) {
        setUser(result.userData.user);
        setEditedUser(result.userData.user);
        Alert.alert('Success', result.message || 'Location updated successfully!');
      } else {
        LocationService.showLocationErrorAlert(result, {
          title: 'Get Location Failed',
          onRetry: () => getCurrentLocation(),
          onCancel: () => {}
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await ApiService.updateUserProfile(editedUser);
      
      if (response.success) {
        setUser(response.data.user);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {profileLoading ? (
          <SkeletonLoader type="profile" />
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.profileGradient}
            >
              <TouchableOpacity 
                style={styles.profileAvatar}
                onPress={handleImagePicker}
                disabled={uploading}
              >
                {user?.profilePicture ? (
                  <Image 
                    source={{ uri: user.profilePicture }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </Text>
                  </LinearGradient>
                )}
                <View style={styles.cameraOverlay}>
                  <Ionicons 
                    name={uploading ? "hourglass" : "camera"} 
                    size={16} 
                    color="white" 
                  />
                </View>
              </TouchableOpacity>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.profileBadge}>
                  <LinearGradient
                    colors={['#F3E8FF', '#FED7AA']}
                    style={styles.badgeGradient}
                  >
                    <Ionicons name="star" size={12} color="#FB923C" />
                    <Text style={styles.badgeText}>Verified User</Text>
                  </LinearGradient>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Ionicons name={isEditing ? "close" : "pencil"} size={16} color="#6B46C1" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Profile Details */}
          {isEditing ? (
            <View style={styles.editContainer}>
              <View style={styles.editCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.editGradient}
                >
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editedUser?.firstName || ''}
                      onChangeText={(text) => setEditedUser(prev => ({ ...prev, firstName: text }))}
                      placeholder="Enter first name"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editedUser?.lastName || ''}
                      onChangeText={(text) => setEditedUser(prev => ({ ...prev, lastName: text }))}
                      placeholder="Enter last name"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      value={editedUser?.phoneNumber || ''}
                      onChangeText={(text) => setEditedUser(prev => ({ ...prev, phoneNumber: text }))}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                    />
                  </View>
                </LinearGradient>
              </View>
              
              <View style={styles.editCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.editGradient}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <TouchableOpacity 
                      style={styles.locationButton}
                      onPress={handleUpdateLocation}
                      disabled={locationLoading}
                    >
                      <LinearGradient
                        colors={['#FB923C', '#6B46C1']}
                        style={styles.locationGradient}
                      >
                        <Ionicons 
                          name={locationLoading ? "hourglass" : "location"} 
                          size={14} 
                          color="white" 
                        />
                        <Text style={styles.locationButtonText}>Get Current</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.locationInputContainer}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.locationInput]}
                        value={locationSearchText !== '' ? locationSearchText : (editedUser?.location?.formatted || '')}
                        onChangeText={handleLocationTextChange}
                        placeholder="Search or enter your location"
                        placeholderTextColor="#9CA3AF"
                      />
                      {searchLoading && (
                        <ActivityIndicator size="small" color="#FB923C" style={styles.searchLoader} />
                      )}
                      <TouchableOpacity 
                        onPress={handleUpdateLocation}
                        style={styles.locationButton}
                        disabled={locationLoading}
                      >
                        {locationLoading ? (
                          <ActivityIndicator size="small" color="#FB923C" />
                        ) : (
                          <Ionicons name="navigate" size={16} color="#FB923C" />
                        )}
                      </TouchableOpacity>
                    </View>
                    
                    {/* Location Suggestions Dropdown */}
                    {(showLocationDropdown && locationSuggestions.length > 0) && (
                      <View style={styles.suggestionsContainer}>
                        {locationSuggestions.slice(0, 5).map((suggestion, index) => (
                          <TouchableOpacity
                            key={`${suggestion.formatted}-${index}`}
                            style={[
                              styles.suggestionItem,
                              index === Math.min(locationSuggestions.length - 1, 4) && { borderBottomWidth: 0 }
                            ]}
                            onPress={() => selectLocationSuggestion(suggestion)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.suggestionIcon}>
                              <Ionicons name="location" size={18} color="#FB923C" />
                            </View>
                            <Text style={styles.suggestionText} numberOfLines={2}>
                              {suggestion.formatted}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Address</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={editedUser?.location?.fullAddress || ''}
                      onChangeText={(text) => setEditedUser(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, fullAddress: text }
                      }))}
                      placeholder="Enter full address"
                      placeholderTextColor="#9CA3AF"
                      multiline={true}
                      numberOfLines={3}
                    />
                  </View>
                </LinearGradient>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, saving && styles.disabledButton]} 
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.saveGradient}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
            </View>
          ) : (
            <View style={styles.detailsContainer}>
              <View style={styles.detailCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.detailGradient}
                >
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={20} color="#6B46C1" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Full Name</Text>
                      <Text style={styles.detailValue}>{user?.firstName} {user?.lastName}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={20} color="#6B46C1" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{user?.email}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={20} color="#6B46C1" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailValue}>{user?.phoneNumber || 'Not provided'}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
              
              <View style={styles.detailCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.detailGradient}
                >
                  <Text style={styles.sectionTitle}>Location</Text>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={20} color="#6B46C1" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>City</Text>
                      <Text style={styles.detailValue}>{user?.location?.city || 'Not provided'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="map-outline" size={20} color="#6B46C1" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>State</Text>
                      <Text style={styles.detailValue}>{user?.location?.state || 'Not provided'}</Text>
                    </View>
                  </View>
                  
                  {user?.location?.fullAddress && (
                    <View style={styles.detailRow}>
                      <Ionicons name="home-outline" size={20} color="#6B46C1" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>{user.location.fullAddress}</Text>
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </View>
            </View>
          )}


          {!isEditing && (
            <TouchableOpacity 
              style={styles.providerCard}
              onPress={() => {
                if (user?.role === 'provider' || user?.userType === 'provider') {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'ProviderTabs' }],
                  });
                } else {
                  navigation.navigate('Signup', { userType: 'provider' });
                }
              }}
            >
              <LinearGradient
                colors={['#FB923C', '#6B46C1']}
                style={styles.providerGradient}
              >
                <View style={styles.providerContent}>
                  <View>
                    <Text style={styles.providerTitle}>
                      {(user?.role === 'provider' || user?.userType === 'provider') ? 'Go to Provider Dashboard' : 'Become a Service Provider'}
                    </Text>
                    <Text style={styles.providerSubtitle}>
                      {(user?.role === 'provider' || user?.userType === 'provider') 
                        ? 'Manage your services and bookings' 
                        : 'Start earning by offering your services'
                      }
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={24} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {!isEditing && (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.logoutGradient}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Vanitha Vikas v1.0.0</Text>
          </View>
          </ScrollView>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  settingsButton: {
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
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  profileAvatar: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FB923C',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  profileBadge: {
    alignSelf: 'flex-start',
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FB923C',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  // Edit Container Styles
  editContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  editCard: {
    marginBottom: 16,
  },
  editGradient: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  locationButton: {},
  locationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  locationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
    zIndex: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
  },
  saveGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Details Container Styles
  detailsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  detailCard: {
    marginBottom: 16,
  },
  detailGradient: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  // Input Container Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  searchLoader: {
    marginLeft: 8,
  },
  locationInputContainer: {
    position: 'relative',
    marginBottom: 16,
    zIndex: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 150,
    marginBottom: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 15,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  suggestionText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
  providerCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  providerGradient: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  providerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  providerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default Profile;
