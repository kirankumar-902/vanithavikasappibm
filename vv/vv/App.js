import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import Landing from './src/pages/Landing';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import UserTabs from './src/pages/UserTabs';
import ProviderTabs from './src/pages/ProviderTabs';
import Chat from './src/pages/Chat';
import { AuthProvider } from './src/context/AuthContext';
import ApiService from './src/services/api';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Landing');
  const navigationRef = useRef();

  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      console.log('Checking authentication status on app startup...');
      
      // Check if token exists
      const token = await ApiService.getToken();
      
      if (!token) {
        console.log('No token found, showing Landing page');
        setInitialRoute('Landing');
        setIsLoading(false);
        return;
      }

      // Validate token by fetching user profile
      const profileResponse = await ApiService.getUserProfile();
      
      if (profileResponse.success && profileResponse.data?.user) {
        const user = profileResponse.data.user;
        console.log('Valid token found, user type:', user.userType);
        
        // Navigate to appropriate dashboard based on user type
        if (user.userType === 'provider') {
          setInitialRoute('ProviderTabs');
        } else {
          setInitialRoute('UserTabs');
        }
      } else {
        console.log('Invalid token response, showing Landing page');
        setInitialRoute('Landing');
      }
    } catch (error) {
      console.log('Authentication check failed:', error.message);
      // If token validation fails, remove invalid token and show Landing
      await ApiService.removeToken();
      setInitialRoute('Landing');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      key={initialRoute} // Force re-render when initial route changes
    >
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="UserTabs" component={UserTabs} />
        <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
        <Stack.Screen name="Chat" component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
