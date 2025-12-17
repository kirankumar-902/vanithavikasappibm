const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'provider'],
      required: true
    }
  }],
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ service: 1 });
chatSchema.index({ lastMessageTime: -1 });

// Ensure only one chat per user-service combination
chatSchema.index({ 
  'participants.user': 1, 
  service: 1 
}, { 
  unique: true,
  partialFilterExpression: { isActive: true }
});

module.exports = mongoose.model('Chat', chatSchema);