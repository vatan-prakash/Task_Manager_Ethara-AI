// Sirf Admin ko allow karne wala middleware
// protect ke baad use hota hai (req.user available hota hai)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admins only." });
};

module.exports = adminOnly;
