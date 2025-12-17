import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

const Chats = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Delay chats load to ensure app is fully mounted
    const timer = setTimeout(() => {
      loadChats();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const loadChats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await ApiService.getChats();
      
      if (response.success) {
        setChats(response.data.chats || []);
      }
    } catch (error) {
      console.error('Load chats error:', error);
      // Set empty chats on error
      setChats([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    loadChats(true);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { chatId: item._id })}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.chatGradient}
      >
        <View style={styles.chatAvatar}>
          {item.service?.serviceImage ? (
            <Image 
              source={{ uri: item.service.serviceImage }} 
              style={styles.serviceImage}
            />
          ) : (
            <LinearGradient
              colors={['#FB923C', '#6B46C1']}
              style={styles.avatarGradient}
            >
              <Ionicons name="briefcase" size={20} color="white" />
            </LinearGradient>
          )}
        </View>
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.provider?.firstName} {item.provider?.lastName}
            </Text>
            <Text style={styles.chatTime}>
              {formatTime(item.lastMessage?.timestamp || item.createdAt)}
            </Text>
          </View>
          
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage?.content || 'Start a conversation...'}
          </Text>
          
          <View style={styles.chatFooter}>
            <View style={styles.serviceInfo}>
              <Ionicons name="briefcase-outline" size={12} color="#6B7280" />
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.service?.serviceName || 'General Inquiry'}
              </Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const providerName = `${chat.provider?.firstName} ${chat.provider?.lastName}`.toLowerCase();
    const serviceName = chat.service?.serviceName?.toLowerCase() || '';
    return providerName.includes(query) || serviceName.includes(query);
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={() => navigation.navigate('Services')}
          >
            <LinearGradient
              colors={['#FB923C', '#6B46C1']}
              style={styles.newChatGradient}
            >
              <Ionicons name="add" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chats List */}
        {loading ? (
          <LoadingScreen 
            message="Loading Messages..." 
            icon="chatbubbles-outline"
          />
        ) : (
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.chatsList}
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
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Messages Yet</Text>
                <Text style={styles.emptyText}>
                  Start a conversation with a service provider to see your messages here
                </Text>
                <TouchableOpacity 
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('Services')}
                >
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.exploreGradient}
                  >
                    <Text style={styles.exploreText}>Explore Services</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </LinearGradient>
    </View>
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
  newChatButton: {},
  newChatGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  chatsList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  chatItem: {
    marginBottom: 4,
  },
  chatGradient: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chatAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceName: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#FB923C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {},
  exploreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  exploreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
});

export default Chats;
