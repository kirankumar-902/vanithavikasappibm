import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.baseURL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://10.37.63.88:6969';
  }

  async connect() {
    try {
      // Use SecureStore instead of AsyncStorage for token
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        console.log('No token found, cannot connect to socket');
        throw new Error('No authentication token available');
      }

      console.log('Connecting to socket with token:', token.substring(0, 20) + '...');

      // Return a promise that resolves when connected or rejects on error
      return new Promise((resolve, reject) => {
        this.socket = io(this.baseURL, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          forceNew: true,
          timeout: 10000,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 3
        });

        const connectTimeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 15000);

        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket.id);
          this.isConnected = true;
          clearTimeout(connectTimeout);
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.warn('Socket connection error:', error.message);
          this.isConnected = false;
          clearTimeout(connectTimeout);
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.warn('Socket error:', error.message);
        });
      });

    } catch (error) {
      console.error('Socket connection failed:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  clearSocketData() {
    // Clear socket connection and all listeners on logout
    this.removeAllListeners();
    this.disconnect();
    console.log('Socket data cleared');
  }

  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', chatId);
      console.log('Joined chat:', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', chatId);
      console.log('Left chat:', chatId);
    }
  }

  sendMessage(chatId, content) {
    if (this.socket && this.isConnected) {
      console.log('Sending message via socket:', { chatId, content });
      this.socket.emit('send_message', { chatId, content });
    } else {
      console.log('Socket not connected, cannot send message');
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
    }
  }

  startTyping(chatId) {
    if (this.socket && this.isConnected) {
      console.log('Emitting typing_start for chat:', chatId);
      this.socket.emit('typing_start', chatId);
    } else {
      console.log('Cannot emit typing_start - socket not connected');
    }
  }

  stopTyping(chatId) {
    if (this.socket && this.isConnected) {
      console.log('Emitting typing_stop for chat:', chatId);
      this.socket.emit('typing_stop', chatId);
    } else {
      console.log('Cannot emit typing_stop - socket not connected');
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
