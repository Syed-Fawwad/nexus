import mongoose from 'mongoose';

const connectDB = async () => {
  mongoose.connection.on('connected', () => console.log('[EVENT] MongoDB Connected'));
  mongoose.connection.on('error', (err) => console.error(`[EVENT] MongoDB Error: ${err.message}`));
  mongoose.connection.on('disconnected', () => console.log('[EVENT] MongoDB Disconnected'));

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('[ERROR] MONGODB_URI is not defined in environment variables');
      return;
    }
    
    const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
    console.log(`[INFO] Attempting to connect to MongoDB: ${maskedUri}`);

    mongoose.set('bufferCommands', false);

    const options = {
      serverSelectionTimeoutMS: 10000,
    };

    const conn = await mongoose.connect(uri, options);
    console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}`);
    console.log(`[INFO] Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[ERROR] MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;
