const AppError = require("../utils/AppError");

const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");

const mongoose = require("mongoose");

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
   * - 1. Validate request
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
   * - 2. Validate idempotency key
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
   * - 3. Check account status
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
   * - 4. Derive sender balance for ledger
   */
  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    throw new AppError(
      `Insufficient balance. Current balance is ${balance}. Requested balance is ${amount}`,
      400,
    );
  }

  /**
   * - 5. Create transaction(PENDING)
   */

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      idempotencyKey,
      amount,
      status: "PENDING",
    },
    { session },
  );

  /**
   * - 6. Create DEBIT ledger entry
   */
  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );

  /**
   * - 7. Create CREDIT ledger entry
   */
  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  /**
   * - 8. Mark transaction COMPLETED
   */
  transaction.status = "COMPLETED";
  await transaction.save({ session });

  /**
   * 9. Commit MongoDB seccion
   */
  await session.commitTransaction();
  session.endSession();

  /**
   * 10. Send Email notification
   */
}

module.exports = {
  createTransaction,
};
