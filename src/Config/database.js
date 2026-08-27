const mongoose = require("mongoose");
const config = require("./env");

async function connectDatabase() {
  await mongoose.connect(config.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 20,
    minPoolSize: 2
  });
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };