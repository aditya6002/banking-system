const userModel = require("../models/user.model");
const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");

/**
 * - user register controller
 * - POST /api/auth/register
 */
async function userRegisterController(req, res) {
  const { email, password, name } = req.body;
  const isExist = await userModel.findOne({ email: email });

  if (isExist) {
    throw new AppError("User already exists with email.", 422);
  }

  const user = await userModel.create({
    name,
    email,
    password,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token);
  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

/**
 * - user login controller
 * - POST /api/auth/login
 */

async function userLoginController(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");

  console.log(user)
  

  if (!user) {
    throw new AppError("Email or Password is Invalid", 401);
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    throw new AppError("Email or Password is Invalid", 401);
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token);
  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

module.exports = { userRegisterController, userLoginController };
