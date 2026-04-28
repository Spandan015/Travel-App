require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const app      = express();
const PORT     = process.env.PORT || 3000;

require('./models/destination');
require('./models/TravelPackage');
require('./models/Message');
require('./models/Notification');
require('./models/EmailLog');

const esewaRoutes            = require('./routes/esewaRoutes');
const authRoutes             = require('./routes/authRoutes');
const hotelRoutes            = require('./routes/hotelRoutes');
const packageRoutes          = require('./routes/packageRoutes');
const imageRoutes            = require('./routes/imageRoutes');
const hotelBookingRoutes     = require('./routes/hotelBookingRoutes');
const adminRoutes            = require('./routes/adminRoutes');
const guideApplicationRoutes = require('./routes/guideApplicationRoutes');
const businessRoutes         = require('./routes/businessRoutes');
const bookingRoutes          = require('./routes/bookingRoutes');
const guideRoutes            = require('./routes/guideRoutes');
const guideBookingRoutes     = require('./routes/guideBookingRoutes'); // ✅ ADDED
const destinationRoutes      = require('./routes/destinationRoutes');
const regionRoutes           = require('./routes/regionRoutes');
const trekRoutes             = require('./routes/trekRoutes');
const packageBookingRoutes   = require('./routes/packageBookingRoutes');
const trekBookingRoutes      = require('./routes/trekBookingRoutes');
const chatRoutes             = require('./routes/chatRoutes');
const notificationRoutes     = require('./routes/notificationRoutes');
const guideDashboardRoutes   = require('./routes/guideDashboardRoutes');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travel-app', { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected:', mongoose.connection.db.databaseName);
  } catch (err) { console.error('❌ MongoDB failed:', err.message); }
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => { console.log(`🌐 ${req.method} ${req.path}`); next(); });

app.use('/api/esewa',             esewaRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'My Travel Buddy API', time: new Date().toISOString() }));
app.use('/api/auth',              authRoutes);
app.use('/api/hotels',            hotelRoutes);
app.use('/api/packages',          packageRoutes);
app.use('/api/images',            imageRoutes);
app.use('/api/hotel-bookings',    hotelBookingRoutes);
app.use('/api/bookings',          bookingRoutes);
app.use('/api/guides',            guideRoutes);
app.use('/api/guide-bookings',    guideBookingRoutes);    // ✅ ADDED
app.use('/api/destinations',      destinationRoutes);
app.use('/api/regions',           regionRoutes);
app.use('/api/treks',             trekRoutes);
app.use('/api/admin',             adminRoutes);
app.use('/api/guide-applications',guideApplicationRoutes);
app.use('/api/businesses',        businessRoutes);
app.use('/api/package-bookings',  packageBookingRoutes);
app.use('/api/trek-bookings',     trekBookingRoutes);
app.use('/api/chat',              chatRoutes);
app.use('/api/notifications',     notificationRoutes);
app.use('/api/guide-dashboard',   guideDashboardRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

let server = null;
const startServer = async () => {
  if (server) return;
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`✅ Server on port ${PORT}`);
    console.log(`🌍 http://localhost:${PORT}`);
  });
  server.on('error', err => console.error('❌', err));
};

process.on('SIGINT',  () => server?.close(() => process.exit(0)));
process.on('SIGTERM', () => server?.close(() => process.exit(0)));

startServer();