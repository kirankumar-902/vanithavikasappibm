import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://vanithavikasappibm.vercel.app';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getToken() {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      console.log('Retrieved token from storage:', token ? token.substring(0, 20) + '...' : 'null');
      if (!token) {
        console.log('No token found in storage');
        return null;
      }
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      if (token) {
        console.log('Storing token:', token.substring(0, 20) + '...');
        await SecureStore.setItemAsync('userToken', token);
        console.log('Token stored successfully');
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync('userToken');
      console.log('Token removed successfully');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration globally
        if (response.status === 401) {
          console.log('Token expired or invalid, removing token');
          await this.removeToken();
          // Notify app about token expiration if callback is set
          if (this.onTokenExpired) {
            this.onTokenExpired();
          }
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Method to set token expiration callback
  setTokenExpirationCallback(callback) {
    this.onTokenExpired = callback;
  }

  // Get categories
  async getCategories() {
    try {
      const response = await fetch(`${this.baseURL}/api/categories`);
      const result = await response.json();
      console.log('Fetched categories from backend:', result.data?.categories?.map(c => c.name));
      return result;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  // Get user chats
  async getChats() {
    try {
      const token = await this.getToken();
      
      if (!token) {
        console.log('No token available for chats request');
        return { success: true, data: { chats: [] } };
      }
      
      const response = await fetch(`${this.baseURL}/api/chat/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get chats error:', error);
      // Return empty chats for now
      return { success: true, data: { chats: [] } };
    }
  }

  // Get user bookings
  async getBookings() {
    try {
      const token = await this.getToken();
      
      if (!token) {
        console.log('No token available for bookings request');
        return { success: true, data: { bookings: [] } };
      }
      
      const response = await fetch(`${this.baseURL}/api/user/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get bookings error:', error);
      return { success: true, data: { bookings: [] } };
    }
  }

  // Create booking
  async createBooking(serviceId, bookingData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required to create booking');
      }
      
      const response = await fetch(`${this.baseURL}/api/user/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: serviceId,
          ...bookingData
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const token = await this.getToken();
      console.log('Making profile request with token:', token ? 'present' : 'null');
      
      if (!token) {
        throw new Error('No token provided');
      }
      
      const response = await fetch(`${this.baseURL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, remove it
          await this.removeToken();
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Get service by ID
  async getServiceById(serviceId) {
    try {
      const response = await fetch(`${this.baseURL}/api/services/${serviceId}`);
      return await response.json();
    } catch (error) {
      console.error('Get service by ID error:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email, password, userType = 'user') {
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          userType,
        }),
      });
      
      // Store token if login successful
      if (response.success && response.data?.token) {
        await this.setToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(userData) {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      const token = await this.getToken();
      
      if (token) {
        const response = await this.makeRequest('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      // Clear all stored data on logout
      await this.clearAllStoredData();
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Clear all stored data even if logout fails
      await this.clearAllStoredData();
      console.error('Logout error:', error);
      return { success: true, message: 'Logged out successfully' };
    }
  }

  async clearAllStoredData() {
    try {
      // Remove authentication token
      await this.removeToken();
      
      // Clear socket connections and data
      const SocketService = require('./socket').default;
      if (SocketService) {
        SocketService.clearSocketData();
      }
      
      // Clear any other stored data that might persist between sessions
      // Add more storage keys here if needed in the future
      console.log('All stored data cleared successfully');
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  }

  async refreshToken(refreshToken) {
    return this.makeRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async forgotPassword(email) {
    return this.makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }


  async updateUserProfile(profileData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${this.baseURL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Upload profile picture to Cloudinary
  async uploadProfilePicture(imageAsset) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Test basic connectivity first
      try {
        const testResponse = await fetch(`${this.baseURL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('Connectivity test status:', testResponse.status);
      } catch (connectError) {
        console.error('Backend connectivity issue:', connectError);
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }

      // Create FormData for React Native
      const formData = new FormData();
      
      // Get file extension from URI or use jpg as default
      const uriParts = imageAsset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpeg';
      
      // React Native specific FormData format
      formData.append('profilePicture', {
        uri: imageAsset.uri,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      });

      console.log('Uploading image:', {
        uri: imageAsset.uri,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
        baseURL: this.baseURL
      });

      const response = await fetch(`${this.baseURL}/api/auth/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Upload profile picture error:', error);
      if (error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection and ensure the backend server is running.');
      }
      throw error;
    }
  }

  // Update location using Geoapify
  async updateUserLocation(latitude, longitude) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates provided');
      }
      
      console.log('Updating user location via API:', { latitude, longitude });
      
      const response = await fetch(`${this.baseURL}/api/user/update-location`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update location response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Location update response:', result);
      return result;
    } catch (error) {
      console.error('Update location error:', error);
      if (error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Search location suggestions using Geoapify
  async searchLocationSuggestions(query) {
    try {
      if (!query || query.length < 3) {
        return {
          success: true,
          data: { suggestions: [] }
        };
      }

      console.log('Searching location suggestions for:', query);
      
      const response = await fetch(`${this.baseURL}/api/user/search-location?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Location search response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Location search response:', result);
      return result;
    } catch (error) {
      console.error('Location search error:', error);
      if (error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Services APIs
  async getServices(filters = {}) {
    try {
      // Remove empty/undefined values from filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      );
      
      const queryParams = new URLSearchParams(cleanFilters).toString();
      const endpoint = queryParams ? `/api/services?${queryParams}` : '/api/services';
      
      console.log('API getServices - Clean filters:', cleanFilters);
      console.log('API getServices - Endpoint:', `${this.baseURL}${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`);
      const result = await response.json();
      
      console.log('API getServices - Response:', result);
      return result;
    } catch (error) {
      console.error('Get services error:', error);
      throw error;
    }
  }


  // Provider-specific APIs
  async getProviderServices() {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${this.baseURL}/api/provider/services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Fetched provider services:', result.data?.services?.map(s => ({
        id: s._id,
        serviceName: s.serviceName,
        serviceLocation: s.serviceLocation,
        phoneNumber: s.phoneNumber
      })));
      
      return result;
    } catch (error) {
      console.error('Get provider services error:', error);
      throw error;
    }
  }

  async createService(serviceData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log('Sending service data to backend:', serviceData);
      
      const response = await fetch(`${this.baseURL}/api/provider/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create service response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Service creation response:', result);
      return result;
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  }

  async updateService(serviceId, serviceData) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${this.baseURL}/api/provider/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  }

  async deleteService(serviceId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${this.baseURL}/api/provider/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  }

  async updateServiceStatus(serviceId, isActive) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${this.baseURL}/api/provider/services/${serviceId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update service status error:', error);
      throw error;
    }
  }

  async uploadServiceImage(imageAsset) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      
      const uriParts = imageAsset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpeg';
      
      formData.append('serviceImage', {
        uri: imageAsset.uri,
        name: `service.${fileType}`,
        type: `image/${fileType}`,
      });

      const response = await fetch(`${this.baseURL}/api/provider/upload-service-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Upload service image error:', error);
      throw error;
    }
  }

  async getProviderConversations() {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${this.baseURL}/api/provider/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get provider conversations error:', error);
      throw error;
    }
  }

  async getProviderStats() {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${this.baseURL}/api/provider/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get provider stats error:', error);
      throw error;
    }
  }

  // Chat APIs
  async getChatMessages(chatId, page = 1, limit = 50) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Add pagination parameters to get recent messages
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await fetch(`${this.baseURL}/api/chat/${chatId}/messages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get chat messages error:', error);
      throw error;
    }
  }

  async sendMessage(chatId, content, mediaUrl = null, messageType = 'text') {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${this.baseURL}/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          mediaUrl, 
          messageType 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async uploadChatImage(imageAsset) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      
      const uriParts = imageAsset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpeg';
      
      formData.append('chatImage', {
        uri: imageAsset.uri,
        name: `chat-image.${fileType}`,
        type: `image/${fileType}`,
      });

      const response = await fetch(`${this.baseURL}/api/chat/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Upload chat image error:', error);
      throw error;
    }
  }

  async startChat(serviceId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log('Starting chat for service:', serviceId);
      
      const response = await fetch(`${this.baseURL}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Start chat error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Chat started successfully:', result.data?.chat?._id);
      return result;
    } catch (error) {
      console.error('Start chat error:', error);
      throw error;
    }
  }
}

export default new ApiService();
