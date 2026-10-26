const mongoose = require("mongoose");

/**
 * MongoDB Connection Handler using Mongoose
 * Practical 5: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Loads connection URI strictly from process.env.MONGO_URI (via dotenv).
 * Never hardcodes connection strings or database credentials.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    const errorMsg = "FATAL: MONGO_URI is not defined in environment variables (.env).";
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
