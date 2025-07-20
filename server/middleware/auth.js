const jwt = require("jsonwebtoken");
const verifyJWT = (req, res, next) => {
  
 const userAgent = req.headers["user-agent"];
 if (!req.cookies.token && userAgent && userAgent.includes("node")) {
    console.log("Skipping auth for SSR request");
    return next();
  }
  const token = req.cookies.token;

  if (!token) return res.status(401).json("No token, Unauthorized");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json("Invalid token");
    req.user = decoded;
    next();
  });
};

module.exports = verifyJWT;