const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

module.exports = async function (req, res, next) {
  // Get token from Authorization header
  console.log("ana hana");
  const authHeader = req.header("Authorization");

  // Check if Authorization header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "No token, authorization denied",
    });
  }

  // Extract token (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];

  // Check if no token
  if (!token) {
    return res
      .status(401)
      .json({ msg: "No token, authorization denied sir bhalk" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.user.id,
    });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
