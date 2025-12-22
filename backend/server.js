require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const guideApplicationRoutes = require("./routes/guideApplicationRoutes");
const guideBookingRoutes = require("./routes/guideBookingRoutes");
const guideRoutes = require("./routes/guideRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const packageRoutes = require("./routes/packageRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const destinationRoutes = require("./routes/destinationRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - ORDER MATTERS!
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (optional - helps with debugging)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/guide-applications", guideApplicationRoutes);
app.use("/api/guide-bookings", guideBookingRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/destinations", destinationRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Travel App API is running!",
    version: "2.0 - Enhanced",
    endpoints: {
      auth: "/api/auth",
      guideApplications: "/api/guide-applications",
      guideBookings: "/api/guide-bookings",
      guides: "/api/guides",
      hotels: "/api/hotels",
      packages: "/api/packages",
      bookings: "/api/bookings",
      destinations: "/api/destinations"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✔  MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`✔  Server running on port ${PORT}`);
      console.log(`✔  API Documentation available at http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB Error:", err.message);
  });