const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [
            /^[6-9]\d{9}$/,
            'Please enter a valid 10-digit Indian phone number'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'provider'],
        required: [true, 'Role is required'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: null
    },
    location: {
        state: String,
        city: String,
        pincode: String,
        // Enhanced location fields for better search
        fullAddress: String,
        latitude: Number,
        longitude: Number,
        placeId: String, // Geoapify place ID
        country: String,
        district: String,
        formatted: String // Full formatted address from Geoapify
    },
    services: [{
        type: String,
        enum: ['home-tuition', 'food-delivery', 'tailoring', 'embroidery', 'dance-lessons', 'community-services']
    }],
    // Professional information for providers
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: ''
    },
    experience: {
        type: String,
        maxlength: [200, 'Experience cannot exceed 200 characters'],
        default: ''
    },
    specializations: {
        type: String,
        maxlength: [300, 'Specializations cannot exceed 300 characters'],
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name virtual
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Transform JSON output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
