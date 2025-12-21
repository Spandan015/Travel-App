const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
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
    req.user = decoded; // { id: ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};