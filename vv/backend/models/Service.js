const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    minlength: [3, 'Service name must be at least 3 characters'],
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  customCategory: {
    type: String,
    trim: true,
    default: null
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least ₹1'],
    max: [100000, 'Price cannot exceed ₹1,00,000']
  },
  serviceImage: {
    type: String,
    default: null
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  serviceLocation: {
    type: String,
    required: [true, 'Service location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit Indian phone number'
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
serviceSchema.index({ provider: 1, category: 1 });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ 'location.city': 1, category: 1 });

// Transform JSON output
serviceSchema.methods.toJSON = function() {
  const service = this.toObject();
  return service;
};

module.exports = mongoose.model('Service', serviceSchema);