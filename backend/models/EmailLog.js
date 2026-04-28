const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    recipient:  { type: String, required: true },
    type: {
      type: String,
      enum: [
        'guide_application_received',
        'guide_approved',
        'guide_rejected',
        'guide_booking_confirmation',
        'guide_booking_accepted',
        'guide_booking_rejected',
        'hotel_booking_confirmation',
        'hotel_payment_confirmed',
        'package_booking_confirmation',
        'package_payment_confirmed',
        'trek_booking_confirmation',
        'trek_payment_confirmed',
        'otp_verification',
        'password_reset',
        'other',
      ],
      required: true,
    },
    subject:   { type: String },
    status:    { type: String, enum: ['sent', 'failed', 'skipped'], default: 'sent' },
    error:     { type: String },
    // Related entity refs
    refUser:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'GuideApplication' },
    refBooking:     { type: mongoose.Schema.Types.ObjectId },
    sentAt:    { type: Date, default: Date.now },
  },
  { timestamps: false }
);

emailLogSchema.index({ recipient: 1, sentAt: -1 });
emailLogSchema.index({ type: 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
