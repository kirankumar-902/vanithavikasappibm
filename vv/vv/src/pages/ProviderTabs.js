import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text } from 'react-native';

// Provider Screens
import ProviderDashboard from './ProviderDashboard';
import MyServices from './MyServices';
import AddService from './AddService';
import ProviderMessages from './ProviderMessages';
import ProviderProfile from './ProviderProfile';

// Shared Screens
import Chat from './Chat';
import ServiceDetails from './ServiceDetails';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProviderDashboard" component={ProviderDashboard} />
    <Stack.Screen name="MyServices" component={MyServices} />
    <Stack.Screen name="AddService" component={AddService} />
    <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
  </Stack.Navigator>
);

// Services Stack
const ServicesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyServices" component={MyServices} />
    <Stack.Screen name="AddService" component={AddService} />
    <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
  </Stack.Navigator>
);

// Messages Stack
const MessagesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProviderMessages" component={ProviderMessages} />
    <Stack.Screen name="Chat" component={Chat} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProviderProfile" component={ProviderProfile} />
  </Stack.Navigator>
);

// Custom Tab Bar Icon Component
const TabIcon = ({ name, color, size, focused }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    {focused ? (
      <LinearGradient
        colors={['#FB923C', '#6B46C1']}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={name} size={size} color="white" />
      </LinearGradient>
    ) : (
      <Ionicons name={name} size={size} color={color} />
    )}
  </View>
);

export default function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#FB923C',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="grid" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="briefcase" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Add Service"
        component={AddService}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="add-circle" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="chatbubbles" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
