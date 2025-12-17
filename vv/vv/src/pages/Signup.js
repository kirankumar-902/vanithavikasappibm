import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';

const Signup = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: route?.params?.userType || 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userType = route?.params?.userType || 'user';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    const { fullName, email, phone, password, confirmPassword } = formData;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Split full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName; // Use firstName as lastName if only one name provided

      const signupData = {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        password,
        role: formData.userType === 'provider' ? 'provider' : 'user',
      };

      const response = await ApiService.signup(signupData);
      
      if (response.success) {
        Alert.alert(
          'Success', 
          `Account created successfully! Welcome to Vanitha Vikas as a ${userType === 'provider' ? 'Service Provider' : 'Customer'}`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('Login', { userType })
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Signup failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="heart" size={40} color="#FB923C" />
            </View>
            <Text style={styles.brandName}>Vanitha Vikas</Text>
            <Text style={styles.welcomeText}>
              Join our community as a {userType === 'provider' ? 'service provider' : 'customer'}
            </Text>
          </View>

          {/* Signup Form */}
          <View style={styles.formContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
              style={styles.formCard}
            >
              <Text style={styles.formTitle}>Create Account</Text>

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* User Type Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>I want to</Text>
                <View style={styles.userTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeOption,
                      formData.userType === 'user' && styles.userTypeSelected
                    ]}
                    onPress={() => handleInputChange('userType', 'user')}
                  >
                    <View style={styles.userTypeContent}>
                      <Ionicons 
                        name="search" 
                        size={24} 
                        color={formData.userType === 'user' ? '#FB923C' : '#6B7280'} 
                      />
                      <Text style={[
                        styles.userTypeText,
                        formData.userType === 'user' && styles.userTypeTextSelected
                      ]}>
                        Find Services
                      </Text>
                      <Text style={styles.userTypeSubtext}>
                        Browse and book services from skilled women
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.userTypeOption,
                      formData.userType === 'provider' && styles.userTypeSelected
                    ]}
                    onPress={() => handleInputChange('userType', 'provider')}
                  >
                    <View style={styles.userTypeContent}>
                      <Ionicons 
                        name="briefcase" 
                        size={24} 
                        color={formData.userType === 'provider' ? '#6B46C1' : '#6B7280'} 
                      />
                      <Text style={[
                        styles.userTypeText,
                        formData.userType === 'provider' && styles.userTypeTextSelected
                      ]}>
                        Offer Services
                      </Text>
                      <Text style={styles.userTypeSubtext}>
                        Showcase your skills and grow your business
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#FB923C', '#6B46C1']}
                  style={styles.signupGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Text style={styles.signupButtonText}>Creating Account...</Text>
                  ) : (
                    <>
                      <Text style={styles.signupButtonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>


              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login', { userType })}
                >
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    borderRadius: 24,
    padding: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.5)',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#FB923C',
    fontWeight: '600',
  },
  signupButton: {
    marginBottom: 24,
  },
  signupGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(209, 213, 219, 0.5)',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.5)',
    marginBottom: 24,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#FB923C',
    fontWeight: '600',
  },
  userTypeContainer: {
    gap: 12,
  },
  userTypeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(209, 213, 219, 0.5)',
  },
  userTypeSelected: {
    borderColor: '#FB923C',
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  userTypeContent: {
    alignItems: 'center',
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  userTypeTextSelected: {
    color: '#FB923C',
  },
  userTypeSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default Signup;
