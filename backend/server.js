require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const destinationRoutes = require("./routes/destinationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/destinations", destinationRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✔ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`✔ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });
