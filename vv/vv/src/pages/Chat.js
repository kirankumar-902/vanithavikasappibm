import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert, Image, Modal, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../services/api';
import SocketService from '../services/socket';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Chat = ({ navigation, route }) => {
  const { chatId, serviceName } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const scrollViewRef = useRef();
  const socketListenersSetup = useRef(false);

  useEffect(() => {
    // Get current user ID from API profile
    const getCurrentUser = async () => {
      try {
        const response = await ApiService.getUserProfile();
        console.log('Full API response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data?.user) {
          const user = response.data.user;
          console.log('User object from API:', user);
          console.log('Setting currentUserId to:', user.id || user._id);
          setCurrentUserId(user.id || user._id);
        } else if (response.data) {
          // Sometimes the user might be directly in data without nested structure
          console.log('Checking direct data structure:', response.data);
          if (response.data.id || response.data._id) {
            console.log('Found user ID in direct data:', response.data.id || response.data._id);
            setCurrentUserId(response.data.id || response.data._id);
          }
        } else {
          console.log('No user data found in API response:', response);
        }
      } catch (error) {
        console.error('Error getting current user from API:', error);
        console.error('Error details:', error.message);
        
        // Temporary fallback - use one of the sender IDs from the logs for testing
        console.log('Using fallback user ID for testing');
        setCurrentUserId('68b55b8377d43c8dcc332900'); // This should match one of the senders
      }
    };
    
    getCurrentUser();
    if (chatId) {
      loadMessages();
    }
    
    // Connect to socket and join chat - Set up listeners immediately
    if (chatId) {
      const connectSocket = async () => {
        try {
          await SocketService.connect();
          console.log('Socket connected, joining chat:', chatId);
          if (SocketService.isConnected) {
            SocketService.joinChat(chatId);
            // Set up socket listeners immediately after connection
            setupSocketListeners();
          } else {
            console.warn('Socket not connected after connection attempt, retrying...');
            // Retry connection after a short delay
            setTimeout(() => {
              if (!SocketService.isConnected) {
                connectSocket();
              }
            }, 2000);
          }
        } catch (error) {
          console.warn('Socket connection failed, chat will work without real-time updates:', error.message);
          // Don't throw error - let chat work without socket
        }
      };
      
      connectSocket();
    }
    
    return () => {
      if (chatId && SocketService.isConnected) {
        try {
          SocketService.leaveChat(chatId);
          SocketService.removeAllListeners();
        } catch (error) {
          console.warn('Error during socket cleanup:', error.message);
        }
        socketListenersSetup.current = false;
      }
    };
  }, [chatId]);

  // Setup socket listeners function
  const setupSocketListeners = () => {
    if (!chatId || !SocketService.socket || socketListenersSetup.current) return;

    console.log('Setting up socket listeners for chat:', chatId);
    socketListenersSetup.current = true;

    // Listen for new messages
    const handleNewMessage = (data) => {
      console.log('Received new message via socket:', data);
      if (data.chatId === chatId && data.message) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(msg => msg._id === data.message._id);
          if (messageExists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          
          // Don't add our own messages via socket (they're already added locally)
          setCurrentUserId(currentId => {
            if (currentId && (data.message.sender._id === currentId || data.message.sender.id === currentId)) {
              console.log('Skipping own message from socket');
              return currentId;
            }
            return currentId;
          });
          
          console.log('Adding new message to state');
          return [...prev, data.message];
        });
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      console.log('User typing:', data);
      setCurrentUserId(currentId => {
        if (data.userId !== currentId) {
          setOtherParticipant(prev => ({
            ...prev,
            isTyping: data.isTyping,
            typingText: data.isTyping ? `${data.userName} is typing...` : null
          }));
        }
        return currentId;
      });
    };

    // Listen for chat join confirmation
    const handleChatJoined = (data) => {
      console.log('Chat join response:', data);
      if (!data.success) {
        console.error('Failed to join chat:', data.message);
      }
    };

    SocketService.onNewMessage(handleNewMessage);
    SocketService.onUserTyping(handleUserTyping);
    SocketService.socket?.on('chat_joined', handleChatJoined);
  };

  // Re-setup listeners when currentUserId becomes available
  useEffect(() => {
    if (currentUserId && SocketService.socket && !socketListenersSetup.current) {
      setupSocketListeners();
    }
  }, [currentUserId]);

  // Scroll to bottom after messages load
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 200);
    }
  }, [messages.length]);

  // Reload messages when currentUserId is available
  useEffect(() => {
    if (currentUserId && chatId) {
      loadMessages();
    }
  }, [currentUserId]);

  const loadMessages = async (page = 1) => {
    try {
      setLoading(true);
      // Load recent messages (last 50 by default)
      const response = await ApiService.getChatMessages(chatId, page, 50);
      if (response.success) {
        setMessages(response.data.messages);
        setChatData(response.data.chat);
        
        // Find the other participant for header display
        if (response.data.chat?.participants && currentUserId) {
          console.log('Chat participants:', response.data.chat.participants);
          console.log('Current user ID:', currentUserId);
          
          const otherParticipant = response.data.chat.participants.find(
            p => p.user._id !== currentUserId && p.user._id.toString() !== currentUserId.toString()
          );
          
          console.log('Found other participant:', otherParticipant);
          
          if (otherParticipant && otherParticipant.user) {
            console.log('Setting other participant user:', otherParticipant.user);
            setOtherParticipant(otherParticipant.user);
          } else {
            console.log('No other participant found or user data missing');
            // Fallback: try to get from service or use a default name
            setOtherParticipant({
              firstName: serviceName || 'User',
              lastName: ''
            });
          }
        }
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to send images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Remove crop option
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage(asset);
        setShowImagePreview(true);
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleImagePress = (imageUrl) => {
    console.log('Image pressed:', imageUrl);
    setFullScreenImage(imageUrl);
    setShowFullScreenImage(true);
  };

  const cancelImageSend = () => {
    setSelectedImage(null);
    setShowImagePreview(false);
  };

  const confirmImageSend = async () => {
    if (selectedImage) {
      setShowImagePreview(false);
      await sendMediaMessage(selectedImage);
      setSelectedImage(null);
    }
  };

  const sendMediaMessage = async (asset) => {
    try {
      setSending(true);
      
      // Add temporary image message to show loading state
      const tempImageMessage = {
        _id: `temp_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: '',
        sender: { _id: currentUserId || 'temp-user' },
        timestamp: new Date(),
        messageType: 'image',
        mediaUrl: asset.uri, // Use local URI for immediate display
        isTemp: true,
        isUploading: true
      };
      setMessages(prev => [...prev, tempImageMessage]);
      
      // Upload image first
      const uploadResponse = await ApiService.uploadChatImage(asset);
      if (!uploadResponse.success) {
        throw new Error('Failed to upload image');
      }
      
      // Send message with image URL
      const response = await ApiService.sendMessage(chatId, '', uploadResponse.data.imageUrl, 'image');
      if (response.success) {
        // Replace temp message with real one
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => 
            msg._id !== tempImageMessage._id && msg._id !== response.data.message._id
          );
          return [...filteredMessages, response.data.message];
        });
        console.log('Media message sent successfully');
      } else {
        throw new Error(response.message || 'Failed to send media message');
      }
    } catch (error) {
      console.error('Send media message error:', error);
      Alert.alert('Error', 'Failed to send image');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => !msg.isUploading));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    
    if (text.trim() && !isTyping && SocketService.isConnected) {
      setIsTyping(true);
      SocketService.startTyping(chatId);
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (SocketService.isConnected) {
        SocketService.stopTyping(chatId);
      }
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      if (SocketService.isConnected) {
        SocketService.stopTyping(chatId);
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }

    try {
      setSending(true);
      
      // Add message to local state immediately for better UX
      const tempMessage = {
        _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: messageText,
        sender: { _id: currentUserId || 'temp-user' },
        timestamp: new Date(),
        isTemp: true
      };
      setMessages(prev => [...prev, tempMessage]);

      if (chatId) {
        // Always use API to ensure message is saved to database
        const response = await ApiService.sendMessage(chatId, messageText);
        if (response.success) {
          // Replace temp message with real one and ensure no duplicates
          setMessages(prev => {
            // Remove temp message and any existing message with same ID
            const filteredMessages = prev.filter(msg => 
              msg._id !== tempMessage._id && msg._id !== response.data.message._id
            );
            // Add the real message
            return [...filteredMessages, response.data.message];
          });
          
          // Don't send via socket - the backend will handle real-time delivery
          // This prevents duplicate messages and ensures proper sender identification
        } else {
          throw new Error(response.message || 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(messageText); // Restore message text
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = (message, index) => {
    // Determine if message is from current user based on sender ID
    // Add explicit string comparison to handle potential type mismatches
    const senderId = message.sender?._id?.toString();
    const userId = currentUserId?.toString();
    const isMyMessage = (senderId === userId) || message.isTemp;
    const isMediaMessage = message.messageType === 'image' && message.mediaUrl;
    
    console.log('Message render debug:', {
      messageId: message._id,
      senderId,
      userId,
      currentUserId,
      isMyMessage,
      content: message.content,
      messageType: message.messageType,
      mediaUrl: message.mediaUrl,
      senderObject: message.sender
    });

    const showDate = index === 0 || 
      formatDate(message.timestamp || message.createdAt) !== formatDate(messages[index - 1].timestamp || messages[index - 1].createdAt);

    // Get sender info for profile image - find the actual sender from participants
    let senderInfo = null;
    if (message.sender) {
      senderInfo = message.sender;
    } else if (chatData?.participants) {
      // Find sender from participants
      senderInfo = chatData.participants.find(p => 
        p.user._id === (isMyMessage ? currentUserId : (chatData.participants.find(p2 => p2.user._id !== currentUserId)?.user._id))
      )?.user;
    }
    const profileImage = senderInfo?.profilePicture;

    return (
      <View key={`message-${message._id}-${index}`} style={styles.messageContainer}>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(message.timestamp || message.createdAt)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.otherMessageRow
        ]}>
          {!isMyMessage && (
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <LinearGradient
                  colors={['#FB923C', '#6B46C1']}
                  style={styles.defaultAvatar}
                >
                  <Text style={styles.avatarText}>
                    {senderInfo?.firstName?.charAt(0) || 'U'}
                  </Text>
                </LinearGradient>
              )}
            </View>
          )}
          
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.otherMessage
          ]}>
            {isMyMessage ? (
              <LinearGradient
                colors={['#FB923C', '#6B46C1']}
                style={styles.messageGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isMediaMessage ? (
                  <View style={styles.imageMessageContainer}>
                    <TouchableOpacity onPress={() => !message.isUploading && handleImagePress(message.mediaUrl)}>
                      <Image 
                        source={{ uri: message.mediaUrl }} 
                        style={[styles.messageImage, message.isUploading && styles.uploadingImage]}
                        resizeMode="cover"
                        onError={(error) => {
                          console.log('Image load error:', error.nativeEvent.error);
                          console.log('Image URL:', message.mediaUrl);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', message.mediaUrl);
                        }}
                      />
                      {message.isUploading && (
                        <View style={styles.imageLoadingOverlay}>
                          <ActivityIndicator size="large" color="white" />
                          <Text style={styles.uploadingText}>Uploading...</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.myMessageText}>{message.content}</Text>
                )}
                <Text style={styles.myMessageTime}>
                  {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.otherMessageContainer}>
                {isMediaMessage ? (
                  <View style={styles.imageMessageContainer}>
                    <TouchableOpacity onPress={() => !message.isUploading && handleImagePress(message.mediaUrl)}>
                      <Image 
                        source={{ uri: message.mediaUrl }} 
                        style={[styles.messageImage, message.isUploading && styles.uploadingImage]}
                        resizeMode="cover"
                        onError={(error) => {
                          console.log('Image load error:', error.nativeEvent.error);
                          console.log('Image URL:', message.mediaUrl);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', message.mediaUrl);
                        }}
                      />
                      {message.isUploading && (
                        <View style={styles.imageLoadingOverlay}>
                          <ActivityIndicator size="large" color="#6B7280" />
                          <Text style={styles.uploadingTextOther}>Uploading...</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.otherMessageText}>{message.content}</Text>
                )}
                <Text style={styles.otherMessageTime}>
                  {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
          </View>
          
          {isMyMessage && (
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <LinearGradient
                  colors={['#FB923C', '#6B46C1']}
                  style={styles.defaultAvatar}
                >
                  <Text style={styles.avatarText}>
                    {senderInfo?.firstName?.charAt(0) || 'P'}
                  </Text>
                </LinearGradient>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          
          <View style={styles.headerInfo}>
            <Text style={styles.clientName}>
              {otherParticipant ? 
                `${otherParticipant.firstName} ${otherParticipant.lastName}` : 
                (serviceName || 'Chat')
              }
            </Text>
            <Text style={styles.onlineStatus}>
              {otherParticipant?.isTyping ? otherParticipant.typingText : 'Online'}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 100);
          }}
          onLayout={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 100);
          }}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : messages.length > 0 ? (
            messages
              .filter((message, index, arr) => 
                // Remove duplicates based on _id
                arr.findIndex(m => m._id === message._id) === index
              )
              .map((message, index) => renderMessage(message, index))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={newMessage}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={selectMedia}
            >
              <Ionicons name="attach" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              <LinearGradient
                colors={newMessage.trim() && !sending ? ['#FB923C', '#6B46C1'] : ['#D1D5DB', '#D1D5DB']}
                style={styles.sendGradient}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={newMessage.trim() && !sending ? "white" : "#9CA3AF"} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Preview Modal */}
        <Modal
          visible={showImagePreview}
          transparent={true}
          animationType="slide"
          onRequestClose={cancelImageSend}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.imagePreviewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Send Image</Text>
                <TouchableOpacity onPress={cancelImageSend}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {selectedImage && (
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
              
              <View style={styles.previewActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={cancelImageSend}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={confirmImageSend}
                  disabled={sending}
                >
                  <LinearGradient
                    colors={['#FB923C', '#6B46C1']}
                    style={styles.confirmGradient}
                  >
                    {sending ? (
                      <View style={styles.sendingContainer}>
                        <ActivityIndicator size="small" color="white" style={styles.sendingSpinner} />
                        <Text style={styles.confirmButtonText}>Sending...</Text>
                      </View>
                    ) : (
                      <Text style={styles.confirmButtonText}>Send</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Full Screen Image Modal */}
        <Modal
          visible={showFullScreenImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFullScreenImage(false)}
        >
          <View style={styles.fullScreenOverlay}>
            <TouchableOpacity 
              style={styles.fullScreenClose}
              onPress={() => setShowFullScreenImage(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            {fullScreenImage && (
              <Image 
                source={{ uri: fullScreenImage }} 
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// Mock messages for demonstration
const mockMessages = [
  {
    _id: '1',
    content: 'Hi! I\'m interested in your tailoring services. Can you help me with a wedding dress?',
    sender: 'client',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    _id: '2',
    content: 'Hello! Yes, I\'d be happy to help you with your wedding dress. I specialize in bridal wear and have over 10 years of experience.',
    sender: 'provider',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000) // 1h 55m ago
  },
  {
    _id: '3',
    content: 'That sounds perfect! What information do you need from me to get started?',
    sender: 'client',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000) // 1h 50m ago
  },
  {
    _id: '4',
    content: 'I\'ll need your measurements, preferred style, fabric choice, and the wedding date. We can also schedule a consultation to discuss the design in detail.',
    sender: 'provider',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000) // 1h 45m ago
  },
  {
    _id: '5',
    content: 'Great! My wedding is in 3 months. When would be a good time for the consultation?',
    sender: 'client',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  }
];

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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  onlineStatus: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageBubble: {
    maxWidth: '70%',
    marginBottom: 4,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageGradient: {
    padding: 14,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    minWidth: 60,
  },
  myMessageText: {
    fontSize: 15,
    color: 'white',
    marginBottom: 6,
    lineHeight: 22,
    fontWeight: '400',
  },
  myMessageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  otherMessageContainer: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 60,
  },
  otherMessageText: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
    fontWeight: '400',
  },
  otherMessageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.3)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  attachButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
  },
  confirmGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
  },
  imageMessageContainer: {
    position: 'relative',
  },
  uploadingImage: {
    opacity: 0.7,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  uploadingTextOther: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  sendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingSpinner: {
    marginRight: 8,
  },
});

export default Chat;
