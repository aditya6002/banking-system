const express = require("express");
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * - Create a new transaction
 * - POST /api/transactions/transfer
 * - Body: { fromAccount, toAccount, amount, idempotencyKey }
 */
router.post(
  "/transfer",
  authMiddleware.isUserLogin,
  transactionController.createTransaction,
);

/**
 * - POST /api/transactions/system/initial
 * - Create initial funds transaction from SYSTEM account to a user account
 * - Body: { toAccount, amount, idempotencyKey }
 */
router.post(
  "/system/initial-funds",
  authMiddleware.isUserLogin,
  authMiddleware.authSystemUserMiddleware,
  transactionController.createInitialTransaction,
);

module.exports = router;
