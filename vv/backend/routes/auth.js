const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const router = express.Router();

// Configure multer for file uploads (memory storage)
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

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_TOKEN, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, role } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Normalize phone number - remove spaces, dashes, and country code
        let normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
        if (normalizedPhone.startsWith('+91')) {
            normalizedPhone = normalizedPhone.substring(3);
        } else if (normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
            normalizedPhone = normalizedPhone.substring(2);
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber: normalizedPhone }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Phone number already registered'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            phoneNumber: normalizedPhone,
            password,
            role
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    fullName: user.fullName
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: errors[0] || 'Validation failed',
                errors
            });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field === 'email' ? 'Email' : 'Phone number'} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    fullName: user.fullName,
                    isVerified: user.isVerified
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = req.user;

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    fullName: user.fullName,
                    isVerified: user.isVerified,
                    profilePicture: user.profilePicture,
                    location: user.location,
                    services: user.services,
                    bio: user.bio,
                    experience: user.experience,
                    specializations: user.specializations,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (users and providers)
// @access  Private
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, location, bio, experience, specializations } = req.body;
        const user = req.user;

        // Both users and providers can update their profile
        // No role restriction needed

        // Prepare update data
        const updateData = {};

        // Update basic profile fields
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (bio) updateData.bio = bio;
        if (experience) updateData.experience = experience;
        if (specializations) updateData.specializations = specializations;

        // Update phone number if provided
        if (phoneNumber) {
            // Validate phone number format
            if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid 10-digit Indian phone number'
                });
            }

            // Check if phone number is already taken by another user
            const existingUser = await User.findOne({ 
                phoneNumber, 
                _id: { $ne: user._id } 
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already registered'
                });
            }

            updateData.phoneNumber = phoneNumber;
        }

        // Update location if provided
        if (location) {
            const locationData = typeof location === 'string' ? JSON.parse(location) : location;
            updateData.location = locationData;
        }

        // Handle profile picture upload
        if (req.file) {
            try {
                // Delete old profile picture if exists
                if (user.profilePicture) {
                    // Extract public_id from URL
                    const urlParts = user.profilePicture.split('/');
                    const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename
                    const publicId = publicIdWithExtension.split('.')[0]; // remove extension
                    await deleteImage(publicId);
                }

                // Upload new image using buffer
                const uploadResult = await uploadImage(req.file.buffer);
                updateData.profilePicture = uploadResult.url;

            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload profile picture'
                });
            }
        }

        // Update user
        console.log('Updating user profile with data:', updateData);
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updateData,
            { new: true, runValidators: true }
        );
        console.log('User profile updated successfully:', updatedUser.email);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser._id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phoneNumber: updatedUser.phoneNumber,
                    role: updatedUser.role,
                    fullName: updatedUser.fullName,
                    isVerified: updatedUser.isVerified,
                    profilePicture: updatedUser.profilePicture,
                    location: updatedUser.location,
                    services: updatedUser.services,
                    bio: updatedUser.bio,
                    experience: updatedUser.experience,
                    specializations: updatedUser.specializations,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);

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
            message: 'Server error during profile update'
        });
    }
});

// @route   POST /api/auth/upload-profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        const user = req.user;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Delete old profile picture if exists
        if (user.profilePicture) {
            try {
                const urlParts = user.profilePicture.split('/');
                const publicIdWithExtension = urlParts.slice(-2).join('/');
                const publicId = publicIdWithExtension.split('.')[0];
                await deleteImage(publicId);
            } catch (deleteError) {
                console.error('Error deleting old image:', deleteError);
            }
        }

        // Upload new image
        const uploadResult = await uploadImage(req.file.buffer);
        
        // Update user profile picture
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { profilePicture: uploadResult.url },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                profilePicture: uploadResult.url,
                user: {
                    id: updatedUser._id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phoneNumber: updatedUser.phoneNumber,
                    role: updatedUser.role,
                    fullName: updatedUser.fullName,
                    isVerified: updatedUser.isVerified,
                    profilePicture: updatedUser.profilePicture,
                    location: updatedUser.location,
                    services: updatedUser.services,
                    bio: updatedUser.bio,
                    experience: updatedUser.experience,
                    specializations: updatedUser.specializations,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
    try {
        // Since we're using JWT tokens, logout is handled client-side
        // This endpoint just confirms successful logout
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
});

module.exports = router;
