const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Basic authentication middleware
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  // Support "Bearer <token>" or just token
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : authHeader;
  
  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (without password)
    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const status = user.status || (user.isActive ? 'active' : 'suspended');
    if (status !== 'active') {
      return res.status(401).json({ message: status === 'pending' ? 'Account pending approval' : 'Account suspended' });
    }
    
    req.user = user; // Attach full user object to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

// Admin-only middleware
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Access denied. Admin only." });
  
  next();
};

// Admin or hotel owner middleware (for shared dashboard routes)
exports.adminOrHotelOwner = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== 'admin' && req.user.role !== 'hotel_owner') {
    return res.status(403).json({ message: "Access denied. Admin or Hotel Owner only." });
  }
  next();
};

// Guide-only middleware
exports.guideOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  
  if (req.user.role !== 'guide') {
    return res.status(403).json({ message: "Access denied. Guide only." });
  }
  
  if (!req.user.guideProfile?.isApproved) {
    return res.status(403).json({ message: "Your guide application is not approved yet" });
  }
  
  next();
};

// Admin or Guide middleware
exports.adminOrGuide = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'guide') {
    return res.status(403).json({ message: "Access denied. Admin or Guide only." });
  }
  
  next();
};

// Check if user is the owner of a resource or an admin
exports.ownerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    const isOwner = req.user._id.toString() === resourceUserId.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    next();
  };
};