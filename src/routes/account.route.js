const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const authController = require("../controllers/account.controller");

/**
 * - POST /api/accounts
 * - Create a new account
 * - Protected Route
 * - Body: { currency }
 */
router.post(
  "/",
  authMiddleware.isUserLogin,
  authController.createAccountController,
);

module.exports = router;
