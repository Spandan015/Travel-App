const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());

// MONGO URI
const MONGO_URI =
  "mongodb+srv://raispandan444_db_user:ssspandann222@cluster0.edr8v2t.mongodb.net/TravelApp";

// Routes MUST COME BEFORE listen()
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => res.send("Backend running"));

// Connect to MongoDB & Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✔ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`✔ Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));
