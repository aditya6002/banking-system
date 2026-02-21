const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Server error";

  res.status(statusCode).json({
    success: false,
    message,
    status: "failed",
  });
});

module.exports = app;
