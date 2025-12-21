const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide username, email and password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Remove password from response
    const userSafe = user.toObject();
    delete userSafe.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password +email +username");
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or password" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: "Invalid Email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userSafe = {
      id: user._id,
      username: user.username,
      email: user.email
    };

    res.json({
      success: true,
      message: "Login Successful",
      token,
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    // req.user is set in middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};