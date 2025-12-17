import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import UserDashboard from './UserDashboard';
import Services from './Services';
import Categories from './Categories';
import Chats from './Chats';
import Chat from './Chat';
import Profile from './Profile';

const Tab = createBottomTabNavigator();

const UserTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          if (focused) {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <LinearGradient
                  colors={['#FB923C', '#6B46C1']}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name={iconName} size={18} color="white" />
                </LinearGradient>
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6B46C1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={UserDashboard} />
      <Tab.Screen name="Services" component={Services} />
      <Tab.Screen name="Categories" component={Categories} />
      <Tab.Screen name="Chats" component={Chats} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default UserTabs;
