const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const blacklistModel = require("../models/blacklist.model");

/**
 * - isUserLogin Middleware
 */
async function isUserLogin(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  const blacklistedToken = await blacklistModel.findOne({ token });

  if (blacklistedToken) {
    return res.status(401).json({
      message: "Unauthorized access, token is blacklisted",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  const blacklistedToken = await blacklistModel.findOne({ token });

  if (blacklistedToken) {
    return res.status(401).json({
      message: "Unauthorized access, token is blacklisted",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("+systemUser");

    if (!user || !user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, user is not a system user",
      });
    }

    res.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

module.exports = { isUserLogin, authSystemUserMiddleware };
