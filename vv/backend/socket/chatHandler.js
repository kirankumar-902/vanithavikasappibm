const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Store active users and their socket connections
const activeUsers = new Map();

const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        if (!user.isActive) {
            return next(new Error('Authentication error: Account deactivated'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();

    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
    }
};

const handleConnection = (io, socket) => {
    console.log(`User ${socket.user.firstName} connected: ${socket.id}`);

    // Store user connection
    activeUsers.set(socket.userId, {
        socketId: socket.id,
        user: socket.user,
        lastSeen: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join user to all their chat rooms
    joinUserChats(socket);

    // Handle joining a specific chat
    socket.on('join_chat', async (chatId) => {
        try {
            console.log(`User ${socket.user.firstName} (${socket.user.role}) attempting to join chat: ${chatId}`);
            // Verify user is part of this chat
            const chat = await Chat.findById(chatId).populate('participants.user');
            if (chat && chat.participants.some(p => p.user._id.toString() === socket.userId)) {
                socket.join(`chat_${chatId}`);
                console.log(`User ${socket.user.firstName} (${socket.user.role}) successfully joined chat: ${chatId}`);
                
                // Emit confirmation back to the user
                socket.emit('chat_joined', { chatId, success: true });
            } else {
                console.log(`User ${socket.user.firstName} not authorized for chat: ${chatId}`);
                socket.emit('chat_joined', { chatId, success: false, message: 'Not authorized' });
            }
        } catch (error) {
            console.error('Error joining chat:', error);
            socket.emit('chat_joined', { chatId, success: false, message: 'Error joining chat' });
        }
    });

    // Handle leaving a chat
    socket.on('leave_chat', (chatId) => {
        socket.leave(`chat_${chatId}`);
        console.log(`User ${socket.user.firstName} left chat: ${chatId}`);
    });

    // Handle sending messages - This is now only used for real-time delivery
    // The actual message creation happens via API routes
    socket.on('send_message', async (data) => {
        console.log('Socket send_message event received - this should not be used for message creation');
        // This event is deprecated - messages should be sent via API
    });

    // Handle typing indicators
    socket.on('typing_start', (chatId) => {
        socket.to(`chat_${chatId}`).emit('user_typing', {
            userId: socket.userId,
            userName: socket.user.firstName,
            isTyping: true
        });
    });

    socket.on('typing_stop', (chatId) => {
        socket.to(`chat_${chatId}`).emit('user_typing', {
            userId: socket.userId,
            userName: socket.user.firstName,
            isTyping: false
        });
    });

    // Handle marking messages as read
    socket.on('mark_messages_read', async (data) => {
        try {
            const { chatId } = data;

            await Message.updateMany(
                { 
                    chat: chatId, 
                    sender: { $ne: socket.userId },
                    isRead: false 
                },
                { 
                    isRead: true, 
                    readAt: new Date() 
                }
            );

            // Notify other users in chat that messages were read
            socket.to(`chat_${chatId}`).emit('messages_read', {
                chatId,
                readBy: socket.userId
            });

        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User ${socket.user.firstName} disconnected: ${socket.id}`);
        activeUsers.delete(socket.userId);
    });
};

const joinUserChats = async (socket) => {
    try {
        const userChats = await Chat.find({
            'participants.user': socket.userId,
            isActive: true
        });

        userChats.forEach(chat => {
            socket.join(`chat_${chat._id}`);
        });

        console.log(`User ${socket.user.firstName} (${socket.user.role}) joined ${userChats.length} chats:`, userChats.map(c => c._id));
    } catch (error) {
        console.error('Error joining user chats:', error);
    }
};

const notifyOfflineUsers = async (chat, message, senderId) => {
    try {
        // Find participants who are not currently online
        const offlineParticipants = chat.participants.filter(p => 
            p.user.toString() !== senderId && !activeUsers.has(p.user.toString())
        );

        // Here you can implement push notifications, email notifications, etc.
        // For now, we'll just log
        if (offlineParticipants.length > 0) {
            console.log(`Notifying ${offlineParticipants.length} offline users about new message`);
        }
    } catch (error) {
        console.error('Error notifying offline users:', error);
    }
};

const getActiveUsers = () => {
    return Array.from(activeUsers.values()).map(user => ({
        userId: user.user._id,
        name: user.user.firstName + ' ' + user.user.lastName,
        lastSeen: user.lastSeen
    }));
};

module.exports = {
    authenticateSocket,
    handleConnection,
    getActiveUsers
};