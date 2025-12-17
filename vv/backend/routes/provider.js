const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../utils/cloudinary');
const Service = require('../models/Service');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   GET /api/provider/dashboard
// @desc    Get provider dashboard data
// @access  Private (Providers only)
router.get('/dashboard', auth, async (req, res) => {
    try {
        const user = req.user;

        // Check if user is a provider
        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can access this endpoint.'
            });
        }

        // Get provider's services
        const services = await Service.find({ provider: user._id });
        const activeServices = services.filter(service => service.isActive);

        // Get provider's chats (for booking/inquiry count)
        const chats = await Chat.find({ 
            participants: user._id 
        }).populate('participants', 'firstName lastName role');

        // Calculate stats
        const totalServices = services.length;
        const totalActiveServices = activeServices.length;
        const totalChats = chats.length;

        // Mock earnings calculation (you can implement actual booking system later)
        const mockMonthlyEarnings = services.reduce((total, service) => {
            return total + (service.price * Math.floor(Math.random() * 5)); // Mock bookings
        }, 0);

        // Mock rating calculation
        const mockAverageRating = 4.2 + (Math.random() * 0.7);
        const mockTotalReviews = Math.floor(Math.random() * 50) + 10;

        // Recent activity (last 5 chats)
        const recentChats = chats
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                stats: {
                    totalServices,
                    activeServices: totalActiveServices,
                    totalBookings: Math.floor(Math.random() * 20) + 5, // Mock data
                    monthlyEarnings: mockMonthlyEarnings,
                    averageRating: mockAverageRating,
                    totalReviews: mockTotalReviews,
                    totalChats
                },
                services: services.slice(0, 5), // Recent 5 services
                recentActivity: recentChats
            }
        });

    } catch (error) {
        console.error('Provider dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard data'
        });
    }
});

// @route   GET /api/provider/analytics
// @desc    Get provider analytics data
// @access  Private (Providers only)
router.get('/analytics', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can access this endpoint.'
            });
        }

        // Get date range from query params (default to last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Get provider's services
        const services = await Service.find({ provider: user._id });

        // Mock analytics data (implement actual tracking later)
        const analyticsData = {
            serviceViews: {
                total: Math.floor(Math.random() * 500) + 100,
                thisMonth: Math.floor(Math.random() * 200) + 50,
                growth: Math.floor(Math.random() * 30) - 10 // -10 to +20% growth
            },
            inquiries: {
                total: Math.floor(Math.random() * 100) + 20,
                thisMonth: Math.floor(Math.random() * 40) + 10,
                growth: Math.floor(Math.random() * 25) - 5
            },
            bookings: {
                total: Math.floor(Math.random() * 50) + 10,
                thisMonth: Math.floor(Math.random() * 20) + 5,
                growth: Math.floor(Math.random() * 20) - 5
            },
            earnings: {
                total: services.reduce((sum, service) => sum + service.price, 0) * 2,
                thisMonth: services.reduce((sum, service) => sum + service.price, 0),
                growth: Math.floor(Math.random() * 30) - 10
            },
            topPerformingServices: services
                .sort(() => Math.random() - 0.5) // Random sort for mock data
                .slice(0, 3)
                .map(service => ({
                    _id: service._id,
                    serviceName: service.serviceName,
                    category: service.category,
                    views: Math.floor(Math.random() * 100) + 20,
                    inquiries: Math.floor(Math.random() * 20) + 5,
                    bookings: Math.floor(Math.random() * 10) + 2
                })),
            categoryPerformance: [
                { category: 'tailoring', bookings: Math.floor(Math.random() * 15) + 5 },
                { category: 'cooking', bookings: Math.floor(Math.random() * 12) + 3 },
                { category: 'beauty-services', bookings: Math.floor(Math.random() * 18) + 7 },
                { category: 'teaching', bookings: Math.floor(Math.random() * 10) + 2 },
                { category: 'arts-and-crafts', bookings: Math.floor(Math.random() * 8) + 1 }
            ]
        };

        res.json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Provider analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics data'
        });
    }
});

// @route   GET /api/provider/services
// @desc    Get all services for the authenticated provider
// @access  Private (Providers only)
router.get('/services', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can access this endpoint.'
            });
        }

        const { page = 1, limit = 10, category, status, search } = req.query;

        // Build query
        let query = { provider: user._id };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        if (search) {
            query.$or = [
                { serviceName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const services = await Service.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('provider', 'firstName lastName email');

        // Log fetched services data for debugging
        console.log('Fetched services from DB:', services.map(s => ({
            id: s._id,
            serviceName: s.serviceName,
            serviceLocation: s.serviceLocation,
            phoneNumber: s.phoneNumber
        })));

        // Get total count for pagination
        const total = await Service.countDocuments(query);

        res.json({
            success: true,
            data: {
                services,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Provider services error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching services'
        });
    }
});

// @route   PATCH /api/provider/services/:id/toggle
// @desc    Toggle service active status
// @access  Private (Providers only)
router.patch('/services/:id/toggle', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can access this endpoint.'
            });
        }

        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check ownership
        if (service.provider.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only modify your own services'
            });
        }

        // Toggle status
        service.isActive = !service.isActive;
        await service.save();

        res.json({
            success: true,
            message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                service
            }
        });

    } catch (error) {
        console.error('Service toggle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling service status'
        });
    }
});

// @route   GET /api/provider/bookings
// @desc    Get provider's bookings (mock endpoint for future implementation)
// @access  Private (Providers only)
router.get('/bookings', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can access this endpoint.'
            });
        }

        // Mock bookings data (implement actual booking system later)
        const mockBookings = [
            {
                _id: 'booking1',
                customer: {
                    name: 'Priya Sharma',
                    phone: '+91 9876543210'
                },
                service: {
                    name: 'Bridal Makeup',
                    price: 5000
                },
                date: new Date(Date.now() + 86400000), // Tomorrow
                status: 'confirmed',
                createdAt: new Date(Date.now() - 86400000) // Yesterday
            },
            {
                _id: 'booking2',
                customer: {
                    name: 'Anita Patel',
                    phone: '+91 9876543211'
                },
                service: {
                    name: 'Cooking Classes',
                    price: 2000
                },
                date: new Date(Date.now() + 172800000), // Day after tomorrow
                status: 'pending',
                createdAt: new Date(Date.now() - 172800000) // 2 days ago
            }
        ];

        res.json({
            success: true,
            data: {
                bookings: mockBookings,
                stats: {
                    total: mockBookings.length,
                    confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
                    pending: mockBookings.filter(b => b.status === 'pending').length,
                    completed: 0
                }
            }
        });

    } catch (error) {
        console.error('Provider bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings'
        });
    }
});

// @route   POST /api/provider/services
// @desc    Create a new service
// @access  Private (Providers only)
router.post('/services', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can create services.'
            });
        }

        const { serviceName, category, customCategory, price, description, location, phoneNumber, serviceImage } = req.body;

        // Validate required fields
        if (!serviceName || !category || !price || !description || !location || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: serviceName, category, price, description, location, phoneNumber'
            });
        }

        console.log('Creating new service with data:', {
            serviceName,
            category: category === 'Other' ? customCategory : category,
            customCategory: category === 'Other' ? customCategory : null,
            price: parseFloat(price),
            description,
            serviceLocation: location,
            phoneNumber,
            provider: user._id,
            serviceImage
        });

        console.log('Raw request body:', req.body);
        console.log('Extracted location:', location);
        console.log('Extracted phoneNumber:', phoneNumber);
        
        const service = new Service({
            serviceName,
            category: category === 'Other' ? customCategory : category,
            customCategory: category === 'Other' ? customCategory : null,
            price: parseFloat(price),
            description,
            serviceLocation: location,
            phoneNumber,
            provider: user._id,
            serviceImage
        });

        await service.save();
        console.log('Service created successfully:', service._id);
        console.log('Saved service data:', {
            serviceLocation: service.serviceLocation,
            phoneNumber: service.phoneNumber,
            serviceName: service.serviceName
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: { service }
        });

    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating service'
        });
    }
});

// @route   PUT /api/provider/services/:id
// @desc    Update a service
// @access  Private (Providers only)
router.put('/services/:id', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can update services.'
            });
        }

        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check ownership
        if (service.provider.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own services'
            });
        }

        const { serviceName, category, customCategory, price, description, location, phoneNumber, serviceImage } = req.body;

        // Update service fields
        if (serviceName) service.serviceName = serviceName;
        if (category) {
            service.category = category === 'Other' ? customCategory : category;
            service.customCategory = category === 'Other' ? customCategory : null;
        }
        if (price) service.price = parseFloat(price);
        if (description) service.description = description;
        if (location) service.serviceLocation = location;
        if (phoneNumber) service.phoneNumber = phoneNumber;
        if (serviceImage) service.serviceImage = serviceImage;

        await service.save();

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: { service }
        });

    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating service'
        });
    }
});

// @route   DELETE /api/provider/services/:id
// @desc    Delete a service
// @access  Private (Providers only)
router.delete('/services/:id', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can delete services.'
            });
        }

        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check ownership
        if (service.provider.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own services'
            });
        }

        await Service.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting service'
        });
    }
});

// @route   PUT /api/provider/services/:id/status
// @desc    Update service status (active/inactive)
// @access  Private (Providers only)
router.put('/services/:id/status', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can update service status.'
            });
        }

        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check ownership
        if (service.provider.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own services'
            });
        }

        const { isActive } = req.body;
        service.isActive = isActive;
        await service.save();

        res.json({
            success: true,
            message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { service }
        });

    } catch (error) {
        console.error('Update service status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating service status'
        });
    }
});

// @route   POST /api/provider/upload-service-image
// @desc    Upload service image to Cloudinary
// @access  Private (Providers only)
router.post('/upload-service-image', auth, upload.single('serviceImage'), async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can upload service images.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Upload to Cloudinary
        console.log('Uploading service image to Cloudinary...');
        const result = await uploadImage(req.file.buffer, 'vanitha-vikas/service-images');

        res.json({
            success: true,
            message: 'Service image uploaded successfully',
            data: {
                imageUrl: result.url
            }
        });

    } catch (error) {
        console.error('Service image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading service image'
        });
    }
});

// @route   GET /api/provider/conversations
// @desc    Get provider conversations
// @access  Private (Providers only)
router.get('/conversations', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can access conversations.'
            });
        }

        const chats = await Chat.find({ 
            participants: user._id 
        })
        .populate('participants', 'firstName lastName email')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        // Format conversations for mobile app
        const conversations = chats.map(chat => {
            const otherParticipant = chat.participants.find(p => p._id.toString() !== user._id.toString());
            
            return {
                id: chat._id,
                clientName: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
                lastMessage: chat.lastMessage ? chat.lastMessage.content : 'No messages yet',
                lastMessageTime: chat.updatedAt,
                unreadCount: 0, // Implement actual unread count logic
                isOnline: false, // Implement online status logic
                serviceName: chat.serviceName || null
            };
        });

        res.json({
            success: true,
            data: { conversations }
        });

    } catch (error) {
        console.error('Get provider conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching conversations'
        });
    }
});

// @route   GET /api/provider/stats
// @desc    Get provider statistics
// @access  Private (Providers only)
router.get('/stats', auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only providers can access stats.'
            });
        }

        // Get provider's services
        const services = await Service.find({ provider: user._id });
        const activeServices = services.filter(service => service.isActive);

        // Get provider's chats
        const chats = await Chat.find({ participants: user._id });

        // Calculate stats
        const stats = {
            totalServices: services.length,
            activeServices: activeServices.length,
            totalBookings: Math.floor(Math.random() * 20) + 5, // Mock data
            monthlyEarnings: services.reduce((total, service) => {
                return total + (service.price * Math.floor(Math.random() * 3));
            }, 0)
        };

        res.json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        console.error('Get provider stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching stats'
        });
    }
});

module.exports = router;
