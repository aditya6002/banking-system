const accountModel = require("../models/account.model");
const AppError = require("../utils/AppError");

async function createAccountController(req, res) {
  const user = req.user;

  const account = await accountModel.create({
    userId: user._id,
  });

  res.status(201).json({
    account,
  });
}

async function getUserAccountsController(req, res) {
  const accounts = await accountModel.find({ userId: req.user._id });

  res.status(200).json({ accounts });
}

async function getUserAccountsBalanceController(req, res) {
  const accountId = req.params.accountId;

  const account = await accountModel.findOne({
    _id: accountId,
    userId: req.user._id,
  });

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  const balance = await account.getBalance();

  res.status(200).json({ balance });
}

module.exports = {
  createAccountController,
  getUserAccountsController,
  getUserAccountsBalanceController,
};
