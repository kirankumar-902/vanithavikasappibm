const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
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

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, location } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (location) updateData.location = location;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    
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
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/user/bookings
// @desc    Get user bookings
// @access  Private
router.get('/bookings', auth, async (req, res) => {
  try {
    // Mock bookings data - replace with actual database query
    const bookings = [
      {
        _id: '1',
        service: {
          _id: 'service1',
          serviceName: 'Home Cleaning',
          price: 500
        },
        provider: {
          _id: 'provider1',
          firstName: 'John',
          lastName: 'Doe'
        },
        status: 'confirmed',
        scheduledDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10')
      }
    ];

    res.json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
});

// @route   POST /api/user/upload-profile-picture
// @desc    Upload profile picture to Cloudinary
// @access  Private
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'vanitha-vikas/profile-pictures',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: result.secure_url,
        user
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading profile picture'
    });
  }
});

// @route   PUT /api/user/update-location
// @desc    Update user location using Geoapify
// @access  Private
router.put('/update-location', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Get location details from Geoapify
    const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;
    if (!geoapifyApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Geoapify API key not configured'
      });
    }

    const geoapifyUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${geoapifyApiKey}`;
    
    const response = await fetch(geoapifyUrl);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Unable to get location details'
      });
    }

    const result = data.results[0];
    
    // Extract comprehensive location data
    const locationData = {
      latitude,
      longitude,
      city: result.city || result.town || result.village || result.suburb || '',
      state: result.state || result.state_district || result.county || '',
      country: result.country || 'India',
      district: result.state_district || result.county || '',
      pincode: result.postcode || '',
      formatted: result.formatted || '',
      fullAddress: result.formatted || `${result.city || ''}, ${result.state || ''}, ${result.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
      placeId: result.place_id || '',
      // Additional detailed fields
      suburb: result.suburb || '',
      neighbourhood: result.neighbourhood || '',
      housenumber: result.housenumber || '',
      street: result.street || '',
      datasource: result.datasource || {}
    };

    // Update user location
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { location: locationData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        user,
        locationData
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating location'
    });
  }
});

// Search location suggestions using Geoapify
router.get('/search-location', async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 3 characters long'
      });
    }

    const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;
    if (!geoapifyApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Geoapify API key not configured'
      });
    }

    // Use Geoapify autocomplete API for location suggestions
    const geoapifyUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&format=json&limit=5&apiKey=${geoapifyApiKey}`;
    
    const response = await fetch(geoapifyUrl);
    const data = await response.json();

    if (!data.results) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    // Format suggestions for frontend
    const suggestions = data.results.map(result => ({
      formatted: result.formatted || `${result.city || ''}, ${result.state || ''}, ${result.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
      city: result.city || result.town || result.village || '',
      state: result.state || result.state_district || result.county || '',
      country: result.country || 'India',
      lat: result.lat,
      lon: result.lon,
      place_id: result.place_id || ''
    }));

    res.json({
      success: true,
      data: {
        suggestions
      }
    });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching locations'
    });
  }
});

// @route   POST /api/user/bookings
// @desc    Create new booking
// @access  Private
router.post('/bookings', auth, async (req, res) => {
  try {
    const { serviceId, scheduledDate, notes } = req.body;

    if (!serviceId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Service ID and scheduled date are required'
      });
    }

    // Mock booking creation - replace with actual database logic
    const booking = {
      _id: Date.now().toString(),
      user: req.user._id,
      service: serviceId,
      scheduledDate: new Date(scheduledDate),
      notes: notes || '',
      status: 'pending',
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
});

module.exports = router;
