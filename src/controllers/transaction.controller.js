const express = require("express");
const router = express.Router();
const AppError = require("../utils/AppError");

const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");

/**
 * - Create a new transaction
 * The 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction(PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB seccion
 * 10. Send Email notification
 */

async function createTransaction(req, res) {
  /**
   * - Validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    throw new AppError(
      "FromAccount, toAccount, amount and idempotencyKey are required ",
      400,
    );
  }

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    throw new AppError("Invalid fromAccount or toAccount", 400);
  }

  /**
   * - Validate idempotency key
   */
  const existingTransaction = await transactionModel.findOne({
    idempotencyKey,
  });

  if (existingTransaction) {
    if (existingTransaction.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction,
      });
    }
    if (existingTransaction.status === "PENDING") {
      return res.status(200).json({
        message: "Transation is still processing",
      });
    }
    if (existingTransaction.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processiong failed previously, please retry",
      });
    }
    if (existingTransaction.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  /**
   * - Check account status
   */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    throw new AppError(
      "Both accounts must be active to process transaction",
      400,
    );
  }

  /**
   * - Derive sender balance for ledger
   */
  if (fromUserAccount.balance < amount) {
    throw new AppError("Insufficient balance in fromAccount", 400);
  }


  
}

module.exports = router;
