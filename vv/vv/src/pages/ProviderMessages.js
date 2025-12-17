import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import ApiService from '../services/api';

const ProviderMessages = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Use the same chat API as users but for providers
      const response = await ApiService.getChats();
      if (response.success) {
        // Transform chat data to conversation format
        const transformedConversations = response.data.chats.map(chat => {
          // Find the other participant (not the current user)
          const otherParticipant = chat.participants?.find(p => p.role !== 'provider') || chat.participants?.[0];
          
          return {
            id: chat._id,
            chatId: chat._id,
            clientName: otherParticipant?.user ? 
              `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}` : 
              'Unknown Client',
            lastMessage: chat.lastMessage?.content || 'No messages yet',
            lastMessageTime: chat.lastMessage?.createdAt || chat.createdAt,
            unreadCount: 0, // TODO: Implement unread count
            isOnline: false, // TODO: Implement online status
            serviceName: chat.service?.serviceName || 'General Inquiry'
          };
        });
        setConversations(transformedConversations);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
      Alert.alert('Error', 'Failed to load conversations. Please try again.');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FED7AA', '#F3E8FF', '#FCE7F3']}
          style={styles.gradient}
        >
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#FB923C" />
            <Text style={styles.loadingText}>Loading Messages...</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={() => navigation.navigate('Services')}
          >
            <Ionicons name="create-outline" size={24} color="#FB923C" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Conversations List */}
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationCard
              conversation={item}
              onPress={() => navigation.navigate('Chat', { 
                chatId: item.chatId,
                serviceName: item.serviceName 
              })}
            />
          )}
          style={styles.conversationsList}
          contentContainerStyle={styles.conversationsContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'When clients message you about your services, they will appear here'
                }
              </Text>
            </View>
          }
        />
      </LinearGradient>
    </View>
  );
};

const ConversationCard = ({ conversation, onPress }) => {
  return (
    <TouchableOpacity style={styles.conversationCard} onPress={onPress}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.conversationGradient}
      >
        <View style={styles.conversationContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FB923C', '#6B46C1']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {conversation.clientName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            {conversation.isOnline && <View style={styles.onlineIndicator} />}
          </View>

          {/* Conversation Info */}
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <Text style={styles.clientName} numberOfLines={1}>
                {conversation.clientName}
              </Text>
              <Text style={styles.timestamp}>
                {formatTime(conversation.lastMessageTime)}
              </Text>
            </View>
            
            <View style={styles.messageRow}>
              <Text style={styles.lastMessage} numberOfLines={2}>
                {conversation.lastMessage}
              </Text>
              {conversation.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </Text>
                </View>
              )}
            </View>

            {/* Service Context */}
            {conversation.serviceName && (
              <View style={styles.serviceContext}>
                <Ionicons name="briefcase" size={12} color="#6B46C1" />
                <Text style={styles.serviceName} numberOfLines={1}>
                  {conversation.serviceName}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Mock data for demonstration
const mockConversations = [
  {
    id: '1',
    clientName: 'Priya Sharma',
    lastMessage: 'Hi, I\'m interested in your tailoring services. Can you help me with a wedding dress?',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    unreadCount: 2,
    isOnline: true,
    serviceName: 'Custom Tailoring'
  },
  {
    id: '2',
    clientName: 'Anita Reddy',
    lastMessage: 'Thank you for the cooking class! The biryani recipe was amazing.',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 0,
    isOnline: false,
    serviceName: 'Cooking Classes'
  },
  {
    id: '3',
    clientName: 'Meera Patel',
    lastMessage: 'Can we schedule the beauty session for this weekend?',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    unreadCount: 1,
    isOnline: true,
    serviceName: 'Beauty Services'
  },
  {
    id: '4',
    clientName: 'Kavya Nair',
    lastMessage: 'The embroidery work looks beautiful! When can I pick it up?',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    unreadCount: 0,
    isOnline: false,
    serviceName: 'Arts & Crafts'
  },
  {
    id: '5',
    clientName: 'Sunita Gupta',
    lastMessage: 'I need help with my daughter\'s math homework. Are you available for tutoring?',
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    unreadCount: 3,
    isOnline: false,
    serviceName: 'Teaching'
  }
];

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
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchInputContainer: {
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  conversationCard: {
    marginBottom: 12,
  },
  conversationGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  conversationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
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
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  serviceContext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  serviceName: {
    fontSize: 12,
    color: '#6B46C1',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProviderMessages;
