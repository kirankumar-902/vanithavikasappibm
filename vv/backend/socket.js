const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_TOKEN);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} connected:`, socket.id);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join chat rooms
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content } = data;

        // Verify user is part of this chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const isParticipant = chat.participants.some(
          participant => participant.user.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Create message
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content: content.trim()
        });

        await message.save();

        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          lastMessageTime: message.createdAt
        });

        // Populate message data
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'firstName lastName profilePicture');

        // Emit to all users in the chat
        io.to(`chat_${chatId}`).emit('new_message', {
          message: populatedMessage,
          chatId
        });

        console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.firstName
      });
    });

    socket.on('typing_stop', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.firstName} disconnected:`, socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
