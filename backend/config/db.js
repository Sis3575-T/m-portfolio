const mongoose = require('mongoose');

const encodeCredentials = (uri) => {
  try {
    const atIdx = uri.lastIndexOf('@');
    const colonIdx = uri.indexOf(':', uri.indexOf('://') + 3);
    if (atIdx > -1 && colonIdx > -1 && colonIdx < atIdx) {
      const prefix = uri.slice(0, colonIdx + 1);
      const password = uri.slice(colonIdx + 1, atIdx);
      const rest = uri.slice(atIdx);
      if (password.includes('@') || password.includes(':') || password.includes('%')) {
        const encodedPwd = encodeURIComponent(decodeURIComponent(password));
        return `${prefix}${encodedPwd}${rest}`;
      }
    }
  } catch {}
  return uri;
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    uri = encodeCredentials(uri);
    const safe = uri ? uri.replace(/\/\/.*:.*@/, '//***:***@') : '(not set)';
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
