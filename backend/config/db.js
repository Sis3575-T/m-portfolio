const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const safe = uri ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : '(not set)';
    console.log(`Connecting to MongoDB with URI: ${safe}`);
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
      throw new Error(`MONGODB_URI env var is missing or invalid. Got: ${safe}`);
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
