const jwt = require('jsonwebtoken');

function signAuthToken(user) {
  const payload = {
    userId: String(user._id),
    email: user.email,
    role: user.role,
    status: user.status || (user.isActive ? 'active' : 'suspended'),
    name: (user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim()).trim()
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { signAuthToken };

