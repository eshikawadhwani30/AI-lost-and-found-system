const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose
 * 
 * Flow:
 * 1. Read MONGO_URI from process.env
 * 2. Attempt connection using mongoose.connect()
 * 3. Log database host and connection status
 * 4. Attach event listeners for real-time connection state monitoring
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_and_found_db');

    console.log(`[MongoDB] Connected successfully!`);
    console.log(`[MongoDB] Host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // In production, we do not want the server running without a DB connection
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Warning] Lost connection to MongoDB database.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB Info] Reconnected to MongoDB database.');
});

module.exports = connectDB;
