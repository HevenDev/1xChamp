import jwt from 'jsonwebtoken';

// Protect Middleware to verify token from cookies
export const protect = (req, res, next) => {
  const token = req.cookies.token;  // Get token from cookies

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized, no token provided' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;  // Attach the user ID to the request
    req.isAdmin = decoded.isAdmin;  
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
