const express = require("express");
const authControllers = require("../controllers/auth.controller");
const wrapAsync = require("../middleware/wrapAsync.middleware");
const router = express.Router();

/**
 * - POST /api/auth/register
 */
router.post("/register", wrapAsync(authControllers.userRegisterController));

/**
 * - POST /api/auth/login
 */

router.post("/login", wrapAsync(authControllers.userLoginController));

module.exports = router;
