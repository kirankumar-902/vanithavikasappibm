import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import ApiService from './api';

class LocationService {
  constructor() {
    this.isLocationEnabled = false;
    this.lastKnownLocation = null;
  }

  /**
   * Check if location services are enabled on the device
   */
  async isLocationServicesEnabled() {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      this.isLocationEnabled = enabled;
      return enabled;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Request location permissions with proper error handling
   */
  async requestLocationPermissions() {
    try {
      // Check if location services are enabled
      const servicesEnabled = await this.isLocationServicesEnabled();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use location features.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return { granted: false, reason: 'services_disabled' };
      }

      // Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        return { granted: true };
      } else if (status === 'denied') {
        Alert.alert(
          'Location Permission Required',
          'Location permission is required to provide location-based services. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return { granted: false, reason: 'permission_denied' };
      } else {
        return { granted: false, reason: 'permission_not_granted' };
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request location permissions. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
      return { granted: false, reason: 'error', error };
    }
  }

  /**
   * Get current location with comprehensive error handling
   */
  async getCurrentLocation(options = {}) {
    try {
      // Check permissions first
      const permissionResult = await this.requestLocationPermissions();
      if (!permissionResult.granted) {
        throw new Error(`Location permission not granted: ${permissionResult.reason}`);
      }

      // Default options with timeout and accuracy
      const locationOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
        maximumAge: 10000,
        ...options
      };

      console.log('Getting current location with options:', locationOptions);

      // Get location with timeout
      const location = await Location.getCurrentPositionAsync(locationOptions);
      
      if (!location || !location.coords) {
        throw new Error('Invalid location data received');
      }

      this.lastKnownLocation = location;
      
      return {
        success: true,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp
        }
      };

    } catch (error) {
      console.error('Get current location error:', error);
      
      let errorMessage = 'Unable to get your current location.';
      let errorCode = 'unknown';

      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage = 'Location services are disabled. Please enable them in your device settings.';
        errorCode = 'services_disabled';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage = 'Current location is unavailable. Make sure that location services are enabled and try again.';
        errorCode = 'location_unavailable';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = 'Location request timed out. Please try again.';
        errorCode = 'timeout';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Location permission is required to use this feature.';
        errorCode = 'permission_denied';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Location request timed out. Please try again.';
        errorCode = 'timeout';
      }

      return {
        success: false,
        error: errorMessage,
        errorCode,
        originalError: error
      };
    }
  }

  /**
   * Update user location via API with error handling
   */
  async updateUserLocation(latitude, longitude) {
    try {
      if (!latitude || !longitude) {
        throw new Error('Invalid coordinates provided');
      }

      console.log('Updating user location:', { latitude, longitude });
      
      const response = await ApiService.updateUserLocation(latitude, longitude);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Location updated successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to update location');
      }
    } catch (error) {
      console.error('Update user location error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update location',
        originalError: error
      };
    }
  }

  /**
   * Get current location and update via API
   */
  async getCurrentLocationAndUpdate(options = {}) {
    try {
      // Get current location
      const locationResult = await this.getCurrentLocation(options);
      
      if (!locationResult.success) {
        return locationResult;
      }

      const { latitude, longitude } = locationResult.location;
      
      // Update location via API
      const updateResult = await this.updateUserLocation(latitude, longitude);
      
      if (updateResult.success) {
        return {
          success: true,
          location: locationResult.location,
          userData: updateResult.data,
          message: 'Location updated successfully'
        };
      } else {
        return {
          success: false,
          error: updateResult.error,
          location: locationResult.location
        };
      }
    } catch (error) {
      console.error('Get and update location error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get and update location',
        originalError: error
      };
    }
  }

  /**
   * Search location suggestions with error handling
   */
  async searchLocationSuggestions(query) {
    try {
      if (!query || query.length < 3) {
        return {
          success: true,
          suggestions: []
        };
      }

      console.log('Searching location suggestions for:', query);
      
      const response = await ApiService.searchLocationSuggestions(query);
      
      if (response.success) {
        return {
          success: true,
          suggestions: response.data.suggestions || []
        };
      } else {
        throw new Error(response.message || 'Failed to search locations');
      }
    } catch (error) {
      console.error('Search location suggestions error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search location suggestions',
        suggestions: [],
        originalError: error
      };
    }
  }

  /**
   * Show location error alert with appropriate message and actions
   */
  showLocationErrorAlert(error, options = {}) {
    const { 
      title = 'Location Error',
      showRetry = true,
      showSettings = true,
      onRetry,
      onCancel
    } = options;

    let message = error.error || error.message || 'An unknown location error occurred.';
    let buttons = [];

    // Add retry button if requested
    if (showRetry && onRetry) {
      buttons.push({
        text: 'Retry',
        onPress: onRetry,
        style: 'default'
      });
    }

    // Add settings button for permission-related errors
    if (showSettings && (error.errorCode === 'permission_denied' || error.errorCode === 'services_disabled')) {
      buttons.push({
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Location.requestForegroundPermissionsAsync();
          } else {
            // For Android, you might want to use a library like react-native-android-open-settings
            Location.requestForegroundPermissionsAsync();
          }
        },
        style: 'default'
      });
    }

    // Add cancel/OK button
    buttons.push({
      text: buttons.length > 0 ? 'Cancel' : 'OK',
      onPress: onCancel,
      style: 'cancel'
    });

    Alert.alert(title, message, buttons);
  }

  /**
   * Get last known location
   */
  getLastKnownLocation() {
    return this.lastKnownLocation;
  }

  /**
   * Clear cached location data
   */
  clearLocationCache() {
    this.lastKnownLocation = null;
  }
}

export default new LocationService();
