import mongoose from 'mongoose';

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.warn('⚠️ [DB] MONGO_URI is not defined in environment variables. Database connection skipped.');
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('🔌 [DB] MongoDB Atlas connection established successfully.');
  } catch (error) {
    console.error('❌ [DB] MongoDB Atlas connection failed:', error.message);
    process.exit(1);
  }
}
