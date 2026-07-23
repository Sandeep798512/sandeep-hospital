const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('\x1b[33m%s\x1b[0m', '⚠️ [WARNING] MongoDB connection failed. Database operations will be unavailable.');
    console.log('\x1b[33m%s\x1b[0m', 'Please make sure MongoDB is running locally or configure MONGO_URI in backend/.env.');
  }
};

module.exports = connectDB;
