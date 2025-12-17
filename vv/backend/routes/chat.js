const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Service = require('../models/Service');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/chat/start
// @desc    Start a chat with a service provider
// @access  Private (users only)
router.post('/start', auth, async (req, res) => {
    try {
        const { serviceId } = req.body;
        const user = req.user;

        // Check if user is not a provider
        if (user.role !== 'user') {
            return res.status(403).json({
                success: false,
                message: 'Only users can start chats with providers'
            });
        }

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: 'Service ID is required'
            });
        }

        // Find the service
        const service = await Service.findById(serviceId).populate('provider');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        if (!service.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Service is not available'
            });
        }

        // Prevent users from starting chats with their own services
        if (service.provider._id.toString() === user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot start a chat with your own service'
            });
        }

        // Check if chat already exists
        let existingChat = await Chat.findOne({
            'participants.user': { $all: [user._id, service.provider._id] },
            service: serviceId,
            isActive: true
        }).populate([
            {
                path: 'participants.user',
                select: 'firstName lastName email profilePicture'
            },
            {
                path: 'service',
                select: 'serviceName category price serviceImage'
            },
            {
                path: 'lastMessage'
            }
        ]);

        if (existingChat) {
            return res.json({
                success: true,
                message: 'Chat already exists',
                data: {
                    chat: existingChat
                }
            });
        }

        // Debug logging
        console.log('Creating chat between:');
        console.log('User (client):', user._id, user.firstName, user.lastName);
        console.log('Provider:', service.provider._id, service.provider.firstName, service.provider.lastName);

        // Create new chat
        const newChat = new Chat({
            participants: [
                { user: user._id, role: 'user' },
                { user: service.provider._id, role: 'provider' }
            ],
            service: serviceId
        });

        await newChat.save();

        // Populate the chat data
        const populatedChat = await Chat.findById(newChat._id).populate([
            {
                path: 'participants.user',
                select: 'firstName lastName email profilePicture'
            },
            {
                path: 'service',
                select: 'serviceName category price serviceImage'
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Chat started successfully',
            data: {
                chat: populatedChat
            }
        });

    } catch (error) {
        console.error('Start chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while starting chat'
        });
    }
});

// @route   GET /api/chat/my
// @desc    Get user's chats
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        const user = req.user;

        const chats = await Chat.find({
            'participants.user': user._id,
            isActive: true
        })
        .populate([
            {
                path: 'participants.user',
                select: 'firstName lastName email profilePicture'
            },
            {
                path: 'service',
                select: 'serviceName category price serviceImage'
            },
            {
                path: 'lastMessage'
            }
        ])
        .sort({ lastMessageTime: -1 });

        res.json({
            success: true,
            data: {
                chats
            }
        });

    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching chats'
        });
    }
});

// @route   GET /api/chat/:chatId/messages
// @desc    Get messages for a chat
// @access  Private
router.get('/:chatId/messages', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const user = req.user;

        // Check if user is part of this chat
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        const isParticipant = chat.participants.some(
            participant => participant.user.toString() === user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this chat'
            });
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get messages
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Get total count
        const total = await Message.countDocuments({ chat: chatId });

        // Mark messages as read for the current user
        await Message.updateMany(
            { 
                chat: chatId, 
                sender: { $ne: user._id },
                isRead: false 
            },
            { 
                isRead: true, 
                readAt: new Date() 
            }
        );

        // Populate chat participants for header display
        const populatedChat = await Chat.findById(chatId).populate([
            {
                path: 'participants.user',
                select: 'firstName lastName email profilePicture'
            },
            {
                path: 'service',
                select: 'serviceName category price serviceImage'
            }
        ]);

        res.json({
            success: true,
            data: {
                messages: messages.reverse(), // Reverse to show oldest first
                chat: populatedChat, // Include populated chat data for profile images
                pagination: {
                    current: pageNum,
                    pages: Math.ceil(total / limitNum),
                    total,
                    limit: limitNum
                }
            }
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching messages'
        });
    }
});

// @route   POST /api/chat/:chatId/messages
// @desc    Send a message
// @access  Private
router.post('/:chatId/messages', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, mediaUrl, messageType = 'text' } = req.body;
        const user = req.user;

        if (messageType === 'text' && (!content || !content.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required for text messages'
            });
        }

        if (messageType === 'image' && !mediaUrl) {
            return res.status(400).json({
                success: false,
                message: 'Media URL is required for image messages'
            });
        }

        // Check if user is part of this chat
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        const isParticipant = chat.participants.some(
            participant => participant.user.toString() === user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to send messages in this chat'
            });
        }

        // Create message
        const message = new Message({
            chat: chatId,
            sender: user._id,
            content: messageType === 'text' ? content : (messageType === 'image' ? 'Image' : ''),
            messageType,
            mediaUrl: messageType === 'image' ? mediaUrl : undefined
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

        // Emit to all users in the chat via socket for real-time delivery
        const io = req.app.get('io');
        if (io) {
            console.log(`Broadcasting message to chat_${chatId}:`, {
                messageId: populatedMessage._id,
                sender: populatedMessage.sender.firstName,
                messageType: populatedMessage.messageType,
                content: populatedMessage.content || 'Image'
            });
            io.to(`chat_${chatId}`).emit('new_message', {
                chatId: chatId,
                message: populatedMessage
            });
        } else {
            console.error('Socket.io instance not found for broadcasting message');
        }

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                message: populatedMessage
            }
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending message'
        });
    }
});

// @route   PUT /api/chat/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:chatId/read', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const user = req.user;

        // Check if user is part of this chat
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        const isParticipant = chat.participants.some(
            participant => participant.user.toString() === user._id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this chat'
            });
        }

        // Mark messages as read for the current user
        const result = await Message.updateMany(
            { 
                chat: chatId, 
                sender: { $ne: user._id },
                isRead: false 
            },
            { 
                isRead: true, 
                readAt: new Date() 
            }
        );

        res.json({
            success: true,
            message: 'Messages marked as read',
            data: {
                modifiedCount: result.modifiedCount
            }
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while marking messages as read'
        });
    }
});

// @route   POST /api/chat/upload-image
// @desc    Upload image for chat
// @access  Private
const multer = require('multer');
const { uploadImage } = require('../utils/cloudinary');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

router.post('/upload-image', auth, upload.single('chatImage'), async (req, res) => {
    try {
        const user = req.user;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Upload image to Cloudinary
        const uploadResult = await uploadImage(req.file.buffer);
        
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl: uploadResult.url
            }
        });

    } catch (error) {
        console.error('Upload chat image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
});

module.exports = router;