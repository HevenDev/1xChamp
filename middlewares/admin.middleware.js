export const admin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: 'Forbidden, you do not have admin access' });
  }
  next();
};