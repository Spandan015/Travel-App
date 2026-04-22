const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itineraryId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', default: null },
  destination:  { type: String, required: true },
  days:         { type: Number, required: true },
  totalBudget:  { type: Number, required: true },
  expenses: {
    hotel:      { type: Number, default: 0 },
    food:       { type: Number, default: 0 },
    transport:  { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
  },
  customExpenses: [{ label: String, amount: Number }],
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);