const express = require('express');
const multer = require('multer');
const Service = require('../models/Service');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const router = express.Router();

// Configure multer for service image uploads
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

// @route   POST /api/services
// @desc    Create a new service (providers only)
// @access  Private
router.post('/', auth, upload.single('serviceImage'), async (req, res) => {
    try {
        const { serviceName, category, description, price } = req.body;
        const user = req.user;

        // Check if user is a provider
        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Only providers can create services'
            });
        }

        // Validation
        if (!serviceName || !category || !description || !price) {
            return res.status(400).json({
                success: false,
                message: 'Service name, category, description, and price are required'
            });
        }

        // Validate price
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 1 || priceNum > 100000) {
            return res.status(400).json({
                success: false,
                message: 'Price must be between ₹1 and ₹1,00,000'
            });
        }

        // Get location data from request body or use provider's location
        let locationData = {};
        if (req.body.location) {
            // If location is provided in the request, use it
            locationData = typeof req.body.location === 'string' 
                ? JSON.parse(req.body.location) 
                : req.body.location;
        } else {
            // Otherwise, use provider's location
            locationData = user.location || {};
        }

        // Ensure location data has required fields
        if (!locationData.city && !locationData.state) {
            return res.status(400).json({
                success: false,
                message: 'Service location is required. Please provide location details.'
            });
        }

        // Prepare service data
        const serviceData = {
            serviceName: serviceName.trim(),
            category,
            description: description.trim(),
            price: priceNum,
            provider: user._id,
            location: locationData
        };

        // Handle service image upload
        if (req.file) {
            try {
                const uploadResult = await uploadImage(req.file.buffer, 'vanitha-vikas/services');
                serviceData.serviceImage = uploadResult.url;
            } catch (uploadError) {
                console.error('Service image upload error:', uploadError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload service image'
                });
            }
        }

        // Create service
        const service = new Service(serviceData);
        await service.save();

        // Populate provider details
        await service.populate('provider', 'firstName lastName email phoneNumber location');

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: {
                service
            }
        });

    } catch (error) {
        console.error('Service creation error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during service creation'
        });
    }
});

// @route   GET /api/services
// @desc    Get all services with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { 
            category, 
            city, 
            state, 
            location, 
            search, // Text search parameter
            lat, 
            lon, 
            radius = 50, // Default 50km radius
            page = 1, 
            limit = 10 
        } = req.query;

        console.log('Backend: Received query params:', req.query);

        // Build filter object
        const filter = { isActive: true };
        const andConditions = [];
        
        if (category) {
            filter.category = category;
        }

        // Note: Text search is applied after population to include provider names
        
        // Location-based filtering
        if (location) {
            console.log('Backend: Filtering by location:', location);
            
            const searchTerm = location.trim();
            // Escape special regex characters to prevent regex injection
            const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Search in serviceLocation field (which is a simple string)
            // and also in provider's location fields for comprehensive matching
            const locationConditions = [
                // Match in the service's serviceLocation field
                { 'serviceLocation': new RegExp(escapedTerm, 'i') }
            ];
            
            andConditions.push({
                $or: locationConditions
            });
            
            console.log('Backend: Location filter conditions:', JSON.stringify(andConditions[andConditions.length - 1], null, 2));
        } else {
            // Legacy city/state filtering
            if (city) {
                filter['location.city'] = new RegExp(city, 'i');
            }
            
            if (state) {
                filter['location.state'] = new RegExp(state, 'i');
            }
        }

        // Combine all conditions with AND
        if (andConditions.length > 0) {
            filter.$and = andConditions;
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let services;
        let total;

        // If coordinates are provided, use geospatial search
        if (lat && lon) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters

            // Geospatial query for services within radius
            const geoFilter = {
                ...filter,
                'location.latitude': { $exists: true },
                'location.longitude': { $exists: true }
            };

            // Get all services that match other filters first
            let allServices = await Service.find(geoFilter)
                .populate('provider', 'firstName lastName email phoneNumber location profilePicture')
                .sort({ createdAt: -1 });

            // Apply text search after population (if search term exists)
            if (search && search.trim()) {
                const searchTerm = search.trim().toLowerCase();
                allServices = allServices.filter(service => {
                    const serviceName = service.serviceName.toLowerCase();
                    const description = service.description.toLowerCase();
                    const providerName = `${service.provider.firstName} ${service.provider.lastName}`.toLowerCase();
                    
                    return serviceName.includes(searchTerm) || 
                           description.includes(searchTerm) || 
                           providerName.includes(searchTerm);
                });
            }

            // Filter by distance
            const servicesWithDistance = allServices.map(service => {
                if (service.location.latitude && service.location.longitude) {
                    const distance = calculateDistance(
                        latitude, longitude,
                        service.location.latitude, service.location.longitude
                    );
                    return { ...service.toObject(), distance: Math.round(distance / 1000 * 100) / 100 }; // Convert to km and round
                }
                return { ...service.toObject(), distance: Infinity };
            }).filter(service => service.distance <= parseFloat(radius));

            // Sort by distance and apply pagination
            servicesWithDistance.sort((a, b) => a.distance - b.distance);
            total = servicesWithDistance.length;
            services = servicesWithDistance.slice(skip, skip + limitNum);
        } else {
            // Regular query without geospatial search
            console.log('Backend: Final MongoDB filter:', JSON.stringify(filter, null, 2));
            let allServices = await Service.find(filter)
                .populate('provider', 'firstName lastName email phoneNumber location profilePicture')
                .sort({ createdAt: -1 });

            console.log('Backend: Found services before text search:', allServices.length);
            console.log('Backend: Sample service locations:', allServices.slice(0, 3).map(s => ({
                serviceName: s.serviceName,
                location: s.location
            })));

            // Apply provider name search after population (if search term exists)
            if (search && search.trim()) {
                const searchTerm = search.trim().toLowerCase();
                allServices = allServices.filter(service => {
                    const serviceName = service.serviceName.toLowerCase();
                    const description = service.description.toLowerCase();
                    const providerName = `${service.provider.firstName} ${service.provider.lastName}`.toLowerCase();
                    
                    return serviceName.includes(searchTerm) || 
                           description.includes(searchTerm) || 
                           providerName.includes(searchTerm);
                });
                console.log('Backend: Found services after text search:', allServices.length);
            }

            total = allServices.length;
            services = allServices.slice(skip, skip + limitNum);
            console.log('Backend: Final services count returned:', services.length);
        }

        // Get unique providers count
        const providersCount = await User.countDocuments({ role: 'provider', isVerified: true });

        res.json({
            success: true,
            data: {
                services,
                total,
                providersCount,
                pagination: {
                    current: pageNum,
                    pages: Math.ceil(total / limitNum),
                    total,
                    limit: limitNum
                }
            }
        });

    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching services'
        });
    }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

// @route   GET /api/services/my
// @desc    Get provider's own services
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        const user = req.user;

        // Check if user is a provider
        if (user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Only providers can view their services'
            });
        }

        const services = await Service.find({ provider: user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                services
            }
        });

    } catch (error) {
        console.error('Get my services error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching your services'
        });
    }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('provider', 'firstName lastName email phoneNumber location profilePicture');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        if (!service.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Service is not available'
            });
        }

        res.json({
            success: true,
            data: {
                service
            }
        });

    } catch (error) {
        console.error('Get service error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while fetching service'
        });
    }
});

// @route   PUT /api/services/:id
// @desc    Update service (provider only)
// @access  Private
router.put('/:id', auth, upload.single('serviceImage'), async (req, res) => {
    try {
        const { serviceName, category, description, price } = req.body;
        const user = req.user;

        // Find service
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if user owns this service
        if (service.provider.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own services'
            });
        }

        // Prepare update data
        const updateData = {};

        if (serviceName) updateData.serviceName = serviceName.trim();
        if (category) updateData.category = category;
        if (description) updateData.description = description.trim();
        
        if (price) {
            const priceNum = parseFloat(price);
            if (isNaN(priceNum) || priceNum < 1 || priceNum > 100000) {
                return res.status(400).json({
                    success: false,
                    message: 'Price must be between ₹1 and ₹1,00,000'
                });
            }
            updateData.price = priceNum;
        }

        // Handle location update
        if (req.body.location) {
            const locationData = typeof req.body.location === 'string' 
                ? JSON.parse(req.body.location) 
                : req.body.location;
            updateData.location = locationData;
        }

        // Handle service image update
        if (req.file) {
            try {
                // Delete old image if exists
                if (service.serviceImage) {
                    const urlParts = service.serviceImage.split('/');
                    const publicIdWithExtension = urlParts.slice(-2).join('/');
                    const publicId = publicIdWithExtension.split('.')[0];
                    await deleteImage(publicId);
                }

                // Upload new image
                const uploadResult = await uploadImage(req.file.buffer, 'vanitha-vikas/services');
                updateData.serviceImage = uploadResult.url;

            } catch (uploadError) {
                console.error('Service image upload error:', uploadError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload service image'
                });
            }
        }

        // Update service
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('provider', 'firstName lastName email phoneNumber location profilePicture');

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: {
                service: updatedService
            }
        });

    } catch (error) {
        console.error('Service update error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during service update'
        });
    }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (provider only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = req.user;

        // Find service
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if user owns this service
        if (service.provider.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own services'
            });
        }

        // Delete service image from Cloudinary if exists
        if (service.serviceImage) {
            try {
                const urlParts = service.serviceImage.split('/');
                const publicIdWithExtension = urlParts.slice(-2).join('/');
                const publicId = publicIdWithExtension.split('.')[0];
                await deleteImage(publicId);
            } catch (deleteError) {
                console.error('Error deleting service image:', deleteError);
            }
        }

        // Delete service
        await Service.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('Service deletion error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during service deletion'
        });
    }
});

module.exports = router;