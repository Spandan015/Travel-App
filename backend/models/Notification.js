const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'booking_request',   // guide receives new booking
        'booking_accepted',  // tourist gets accepted
        'booking_rejected',  // tourist gets rejected
        'booking_cancelled', // either party
        'booking_completed', // tour marked complete
        'new_message',       // chat message
        'payment_received',  // payment update
        'review_received',   // new review left
      ],
      required: true,
    },
    title: { type: String, required: true },
    body:  { type: String, required: true },
    isRead: { type: Boolean, default: false },
    // optional link to navigate to on click
    link: { type: String },
    // related booking or message
    refBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'GuideBooking' },
    refMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
