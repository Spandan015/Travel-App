const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GuideBooking',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // optional image attachment (base64 url or file path)
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index for fast per-booking message fetch
messageSchema.index({ booking: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
