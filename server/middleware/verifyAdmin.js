// middleware/verifyAdmin.js
const jwt = require("jsonwebtoken");

const verifyAdminJWT = (req, res, next) => {
  const token = req.cookies.token;

  const userAgent = req.headers["user-agent"];

  if (!req.cookies.token && userAgent && userAgent.includes("node")) {
    console.log("Skipping auth for SSR request");
    return next();
  }
  if (!token) return res.status(401).json("No token, Unauthorized");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json("Invalid token");
    if (decoded.status !== "admin") {
      return res.status(403).json("Access denied. Admins only.");
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyAdminJWT;
