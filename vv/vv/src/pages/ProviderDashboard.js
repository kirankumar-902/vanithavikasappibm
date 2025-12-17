import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';

const ProviderDashboard = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0
  });

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Load user profile
      const profileResponse = await ApiService.getUserProfile();
      if (profileResponse.success) {
        setUser(profileResponse.data.user);
      }

      // Load provider services
      const servicesResponse = await ApiService.getProviderServices();
      if (servicesResponse.success) {
        const userServices = servicesResponse.data.services;
        setServices(userServices);
        
        // Calculate stats
        setStats({
          totalServices: userServices.length,
          activeServices: userServices.filter(s => s.isActive).length
        });
      }
    } catch (error) {
      console.error('Load provider data error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    loadProviderData(true);
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
            <Text style={styles.loadingText}>Loading Dashboard...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FB923C']}
              tintColor="#FB923C"
              title="Pull to refresh"
              titleColor="#6B7280"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.statGradient}
                >
                  <View style={styles.statIcon}>
                    <Ionicons name="briefcase" size={24} color="#FB923C" />
                  </View>
                  <Text style={styles.statNumber}>{stats.totalServices}</Text>
                  <Text style={styles.statLabel}>Total Services</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.statGradient}
                >
                  <View style={styles.statIcon}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.statNumber}>{stats.activeServices}</Text>
                  <Text style={styles.statLabel}>Active Services</Text>
                </LinearGradient>
              </View>
            </View>

          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('AddService')}
              >
                <LinearGradient
                  colors={['#FB923C', '#6B46C1']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="add-circle" size={32} color="white" />
                  <Text style={styles.actionTitle}>Add Service</Text>
                  <Text style={styles.actionSubtitle}>Create new offering</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('MyServices')}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1E40AF']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="list" size={32} color="white" />
                  <Text style={styles.actionTitle}>My Services</Text>
                  <Text style={styles.actionSubtitle}>Manage services</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('ProviderMessages')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="chatbubbles" size={32} color="white" />
                  <Text style={styles.actionTitle}>Messages</Text>
                  <Text style={styles.actionSubtitle}>Chat with clients</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('ProviderProfile')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="person" size={32} color="white" />
                  <Text style={styles.actionTitle}>Profile</Text>
                  <Text style={styles.actionSubtitle}>Update details</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Services */}
          <View style={styles.recentServicesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Services</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyServices')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {services.slice(0, 3).map((service, index) => (
              <View key={service._id || index} style={styles.serviceCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.serviceGradient}
                >
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{service.serviceName}</Text>
                    <Text style={styles.servicePrice}>₹{service.price}</Text>
                  </View>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                  <View style={styles.serviceStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: service.isActive ? '#D1FAE5' : '#FEE2E2' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: service.isActive ? '#065F46' : '#991B1B' }
                      ]}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ))}

            {services.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>No services yet</Text>
                <Text style={styles.emptyStateSubtext}>Add your first service to get started</Text>
                <TouchableOpacity 
                  style={styles.addFirstServiceButton}
                  onPress={() => navigation.navigate('AddService')}
                >
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.addFirstServiceGradient}
                  >
                    <Text style={styles.addFirstServiceText}>Add Service</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
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
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logoutButton: {
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
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
  },
  statGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
  },
  actionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  recentServicesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FB923C',
    fontWeight: '600',
  },
  serviceCard: {
    marginBottom: 12,
  },
  serviceGradient: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FB923C',
  },
  serviceCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  serviceStatus: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstServiceButton: {
    width: 200,
  },
  addFirstServiceGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  addFirstServiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ProviderDashboard;
