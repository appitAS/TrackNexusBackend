const mongoose = require('mongoose');
const initDefaultConfig = require('../utils/initConfig');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    await initDefaultConfig();      
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
