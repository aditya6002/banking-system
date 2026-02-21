const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Database connected to server");
    })
    .catch((err) => {
      console.log("Database Error", err);
      process.exit(1);
    });
};

module.exports = connectDB;
