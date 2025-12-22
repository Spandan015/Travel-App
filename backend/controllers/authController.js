const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register regular user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    
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
      phone,
      role: 'user'
    });

    const userSafe = user.toObject();
    delete userSafe.password;

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register admin
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password, adminSecretKey } = req.body;
    
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: "Invalid admin secret key" });
    }
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide username, email and password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    const adminSafe = admin.toObject();
    delete adminSafe.password;

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      user: adminSafe,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or password" });
    }
    
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is inactive" });
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
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      guideProfile: user.role === 'guide' ? user.guideProfile : undefined
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

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, phone, profileImage } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    
    await user.save();
    
    const userSafe = user.toObject();
    delete userSafe.password;
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userSafe
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }
    
    const user = await User.findById(req.user.id).select("+password");
    
    const validPass = await bcrypt.compare(currentPassword, user.password);
    if (!validPass) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};