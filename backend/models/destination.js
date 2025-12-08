const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
