import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import ApiService from '../services/api';

const Login = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userType = route?.params?.userType || 'user';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.login(email, password, userType);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Login Successful!',
          text2: `Welcome back ${userType === 'provider' ? 'Service Provider' : 'Customer'}! 🎉`,
          position: 'top',
          visibilityTime: 3000,
        });
        
        // Navigate based on user type from response or route params
        const userRole = response.data?.user?.userType || response.data?.user?.role || userType;
        
        if (userRole === 'provider') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'ProviderTabs' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserTabs' }],
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: response.message || 'Please check your credentials',
          position: 'top',
        });
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
              Welcome back! Sign in to your {userType === 'provider' ? 'provider' : 'customer'} account
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
              style={styles.formCard}
            >
              <Text style={styles.formTitle}>Sign In</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#FB923C', '#6B46C1']}
                  style={styles.loginGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Text style={styles.loginButtonText}>Signing In...</Text>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>


              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup', { userType })}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
      <Toast />
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
    paddingBottom: 0,
    minHeight: '100%',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#FB923C',
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 24,
  },
  loginGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signupLink: {
    fontSize: 14,
    color: '#FB923C',
    fontWeight: '600',
  },
});

export default Login;
