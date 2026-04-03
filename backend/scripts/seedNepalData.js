#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { seedNepalData } = require('../utils/nepalDataSeeder');

async function runSeeder() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travel-app');
    console.log('✅ Connected to MongoDB');

    // Run the seeder
    await seedNepalData();

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runSeeder();
}

module.exports = { runSeeder };










