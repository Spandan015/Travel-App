const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  id:    { type: String, required: true },
  title: { type: String, required: true },
  time:  { type: String, default: '' },
  type:  { type: String, enum: ['sightseeing','food','adventure','transport','accommodation','custom'], default: 'custom' },
  notes: { type: String, default: '' },
});

const daySchema = new mongoose.Schema({
  day:        { type: Number, required: true },
  title:      { type: String, default: '' },
  activities: [activitySchema],
});

const itinerarySchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  days:        { type: Number, required: true, min: 1, max: 30 },
  plan:        [daySchema],
  title:       { type: String, default: '' },
  notes:       { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);