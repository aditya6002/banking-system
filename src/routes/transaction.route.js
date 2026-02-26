const express = require("express");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

/**
 * - Create a new transaction
 * - POST /api/transactions/transfer
 * - Body: { fromAccount, toAccount, amount, idempotencyKey }
 */
router.post("/transfer", transactionController.createTransaction);

module.exports = router;
