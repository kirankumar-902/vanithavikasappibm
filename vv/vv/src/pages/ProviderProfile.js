import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../services/api';

const ProviderProfile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    experience: '',
    specializations: '',
    profilePicture: null
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getUserProfile();
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email,
          phone: userData.phoneNumber,
          bio: userData.bio,
          experience: userData.experience,
          specializations: userData.specializations,
          profilePicture: userData.profilePicture
        });
      }
    } catch (error) {
      console.error('Load profile error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUploading(true);
        try {
          const uploadResponse = await ApiService.uploadProfilePicture(result.assets[0]);
          if (uploadResponse.success) {
            handleInputChange('profilePicture', uploadResponse.data.profilePicture);
            Alert.alert('Success', 'Profile picture updated successfully');
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

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phone.trim(),
        bio: formData.bio.trim(),
        experience: formData.experience.trim(),
        specializations: formData.specializations.trim(),
        profilePicture: formData.profilePicture
      };

      const response = await ApiService.updateUserProfile(updateData);
      if (response.success) {
        setUser({ ...user, ...updateData });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
          style={styles.gradient}
        >
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#FB923C" />
            <Text style={styles.loadingText}>Loading Profile...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons 
              name={isEditing ? "close" : "pencil"} 
              size={20} 
              color="#FB923C" 
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
            <TouchableOpacity 
              style={styles.profilePictureContainer}
              onPress={isEditing ? pickImage : null}
              disabled={imageUploading}
            >
              {formData.profilePicture ? (
                <Image 
                  source={{ uri: formData.profilePicture }} 
                  style={styles.profilePicture}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['#FB923C', '#6B46C1']}
                  style={styles.profilePicturePlaceholder}
                >
                  {imageUploading ? (
                    <ActivityIndicator size="large" color="white" />
                  ) : (
                    <Text style={styles.profilePicturePlaceholderText}>
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </Text>
                  )}
                </LinearGradient>
              )}
              {isEditing && (
                <View style={styles.cameraOverlay}>
                  <Ionicons name="camera" size={24} color="white" />
                </View>
              )}
            </TouchableOpacity>
            
            <Text style={styles.profileName}>
              {formData.firstName} {formData.lastName}
            </Text>
            <Text style={styles.profileEmail}>{formData.email}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={formData.firstName}
                      onChangeText={(value) => handleInputChange('firstName', value)}
                      editable={isEditing}
                      placeholder="First Name"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
                      editable={isEditing}
                      placeholder="Last Name"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    editable={isEditing}
                    placeholder="Phone Number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Professional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Information</Text>
              
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Bio</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={formData.bio}
                    onChangeText={(value) => handleInputChange('bio', value)}
                    editable={isEditing}
                    placeholder="Tell clients about yourself and your services..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Experience</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="time" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.experience}
                    onChangeText={(value) => handleInputChange('experience', value)}
                    editable={isEditing}
                    placeholder="e.g., 5 years in tailoring"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Specializations</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="star" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.specializations}
                    onChangeText={(value) => handleInputChange('specializations', value)}
                    editable={isEditing}
                    placeholder="e.g., Wedding dresses, Embroidery"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

            </View>

            {/* Action Buttons */}
            {isEditing ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.saveGradient}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="white" />
                        <Text style={styles.saveText}>Save Changes</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    loadUserProfile(); // Reset form data
                  }}
                  disabled={saving}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.settingsSection}>
                <TouchableOpacity 
                  style={[styles.settingsItem, styles.logoutItem]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out" size={24} color="#EF4444" />
                  <Text style={[styles.settingsText, styles.logoutText]}>Logout</Text>
                  <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
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
  editButton: {
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
  profilePictureSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicturePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    gap: 16,
  },
  saveButton: {
    marginBottom: 12,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveText: {
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
  settingsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
});

export default ProviderProfile;
