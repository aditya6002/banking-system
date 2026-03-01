const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

/**
 * - POST /api/accounts
 * - Create a new account
 * - Protected Route
 * - Body: { currency }
 */
router.post(
  "/",
  authMiddleware.isUserLogin,
  accountController.createAccountController,
);

/**
 * - /api/accounts
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get(
  "/",
  authMiddleware.isUserLogin,
  accountController.getUserAccountsController,
);

/**
 * - GET /api/accounts/balance/:accountId
 * - Get the balance of a specific account of the logged-in user
 * - Protected Route
*/
router.get(
  "/balance/:accountId",
  authMiddleware.isUserLogin,
  accountController.getUserAccountsBalanceController,
);  



module.exports = router;
