import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from '../utils/api';
import {
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

const Messages = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:6969', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
      });

      newSocket.on('new_message', (data) => {
        const { message } = data;
        if (selectedChat && message.chat === selectedChat._id) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
        // Update chat list with new message
        updateChatLastMessage(message);
      });

      newSocket.on('user_typing', (data) => {
        const { userId, isTyping } = data;
        if (selectedChat && userId !== user._id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });
        }
      });

      newSocket.on('messages_read', (data) => {
        const { chatId } = data;
        if (selectedChat && chatId === selectedChat._id) {
          setMessages(prev => prev.map(msg => 
            msg.sender._id !== user._id ? { ...msg, isRead: true } : msg
          ));
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, selectedChat]);

  // Fetch user's chats
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getMyChats();
      if (response.data.success) {
        setChats(response.data.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await chatAPI.getMessages(chatId);
      if (response.data.success) {
        setMessages(response.data.data.messages);
        // Join the chat room
        if (socket) {
          socket.emit('join_chat', chatId);
          socket.emit('mark_messages_read', { chatId });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    setSendingMessage(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      if (socket) {
        socket.emit('send_message', {
          chatId: selectedChat._id,
          content: messageContent
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = () => {
    if (socket && selectedChat) {
      socket.emit('typing_start', { chatId: selectedChat._id });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { chatId: selectedChat._id });
      }, 1000);
    }
  };

  const updateChatLastMessage = (message) => {
    setChats(prev => prev.map(chat => 
      chat._id === message.chat 
        ? { ...chat, lastMessage: message, lastMessageTime: message.createdAt }
        : chat
    ));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (chat) => {
    console.log('Debug - Chat participants:', chat.participants);
    console.log('Debug - Current user ID:', user._id);
    console.log('Debug - Current user name:', user.firstName, user.lastName);
    
    const otherParticipant = chat.participants.find(p => p.user._id !== user._id)?.user;
    console.log('Debug - Other participant:', otherParticipant);
    
    // If no other participant found (edge case), return a placeholder
    if (!otherParticipant) {
      console.warn('No other participant found - you might be chatting with yourself!');
      return {
        firstName: 'Unknown',
        lastName: 'User',
        profilePicture: null
      };
    }
    
    return otherParticipant;
  };

  // Helper function to get participant by role
  const getParticipantByRole = (chat, role) => {
    const participant = chat.participants.find(p => p.role === role);
    return participant?.user;
  };

  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    const otherUser = getOtherParticipant(chat);
    const serviceName = chat.service?.serviceName || '';
    return (
      otherUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Conversations</h2>
            <span className="text-sm text-gray-500">
              {user.role === 'user' ? 'Your Chats with Providers' : 'Your Chats with Clients'}
            </span>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto chat-messages">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const isSelected = selectedChat?._id === chat._id;
              
              return (
                <div
                  key={chat._id}
                  onClick={() => {
                    setSelectedChat(chat);
                    fetchMessages(chat._id);
                  }}
                  className={`chat-item p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'active' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      {(() => {
                        const provider = getParticipantByRole(chat, 'provider');
                        const client = getParticipantByRole(chat, 'user');
                        const targetUser = user.role === 'user' ? provider : client;
                        
                        return targetUser?.profilePicture ? (
                          <img
                            src={targetUser.profilePicture}
                            alt={`${targetUser.firstName} ${targetUser.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="w-12 h-12 text-gray-400" />
                        );
                      })()}
                      {/* Online indicator could be added here */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="user-info">
                          <h3 className="font-medium text-gray-800 truncate">
                            {(() => {
                              // Use role-based approach for better clarity
                              const provider = getParticipantByRole(chat, 'provider');
                              const client = getParticipantByRole(chat, 'user');
                              
                              if (user.role === 'user') {
                                // User sees provider's name
                                return provider?.firstName && provider?.lastName 
                                  ? `${provider.firstName} ${provider.lastName}` 
                                  : 'Service Provider';
                              } else {
                                // Provider sees client's name
                                return client?.firstName && client?.lastName 
                                  ? `${client.firstName} ${client.lastName}` 
                                  : 'Client';
                              }
                            })()}
                          </h3>
                          <span className={`role-badge ${
                            user.role === 'user' ? 'role-provider' : 'role-client'
                          }`}>
                            {user.role === 'user' ? 'Provider' : 'Client'}
                          </span>
                        </div>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <div className="service-tag mb-1">
                        📋 {chat.service?.serviceName}
                      </div>
                      {chat.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start chatting with service providers from the services page
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const provider = getParticipantByRole(selectedChat, 'provider');
                    const client = getParticipantByRole(selectedChat, 'user');
                    const targetUser = user.role === 'user' ? provider : client;
                    
                    return targetUser?.profilePicture ? (
                      <img
                        src={targetUser.profilePicture}
                        alt={`${targetUser.firstName} ${targetUser.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                      />
                    ) : (
                      <UserCircleIcon className="w-12 h-12 text-gray-400" />
                    );
                  })()}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {(() => {
                          const provider = getParticipantByRole(selectedChat, 'provider');
                          const client = getParticipantByRole(selectedChat, 'user');
                          
                          if (user.role === 'user') {
                            // User sees provider's name
                            return provider?.firstName && provider?.lastName 
                              ? `${provider.firstName} ${provider.lastName}` 
                              : 'Service Provider';
                          } else {
                            // Provider sees client's name
                            return client?.firstName && client?.lastName 
                              ? `${client.firstName} ${client.lastName}` 
                              : 'Client';
                          }
                        })()}
                      </h3>
                      <span className={`role-badge ${
                        user.role === 'user' ? 'role-provider' : 'role-client'
                      }`}>
                        {user.role === 'user' ? 'Service Provider' : 'Client'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-orange-600 font-medium">📋 {selectedChat.service?.serviceName}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-green-600">● Online</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors">
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages bg-gray-50">
              {messages.map((message) => {
                const isOwn = message.sender._id === user._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                      isOwn ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      {!isOwn && (
                        <div className="flex-shrink-0">
                          {message.sender.profilePicture ? (
                            <img
                              src={message.sender.profilePicture}
                              alt={`${message.sender.firstName}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <UserCircleIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div className={`message-bubble px-4 py-2 rounded-lg shadow-sm ${
                        isOwn 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        {/* Sender name for non-own messages */}
                        {!isOwn && (
                          <p className="text-xs font-medium text-orange-600 mb-1">
                            {message.sender.firstName} {message.sender.lastName}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                          {isOwn && message.isRead && (
                            <span className="ml-1 message-read">✓✓</span>
                          )}
                          {isOwn && !message.isRead && (
                            <span className="ml-1 message-sent">✓</span>
                          )}
                        </p>
                      </div>
                      
                      {/* Own avatar */}
                      {isOwn && (
                        <div className="flex-shrink-0">
                          {user?.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={`${user.firstName}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <UserCircleIcon className="w-8 h-8 text-orange-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type your message..."
                  className="chat-input flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;