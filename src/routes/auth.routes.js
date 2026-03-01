const express = require("express");
const authControllers = require("../controllers/auth.controller");
const wrapAsync = require("../middleware/wrapAsync.middleware");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

/**
 * - POST /api/auth/register
 */
router.post("/register", wrapAsync(authControllers.userRegisterController));

/**
 * - POST /api/auth/login
 */

router.post("/login", wrapAsync(authControllers.userLoginController));

/**
 * - POST /api/auth/logout
 * - Protected route, requires authentication
 */
router.post(
  "/logout",
  authMiddleware.isUserLogin,
  wrapAsync(authControllers.userLogoutController),
);

module.exports = router;
