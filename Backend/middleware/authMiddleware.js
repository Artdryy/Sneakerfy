const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization'); // Client sends "Authorization: Bearer <token>"
  
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    // Remove "Bearer " if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET || 'sneakerfy_super_secret_key_2025');
    req.user = verified.user; // Add user info to the request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};