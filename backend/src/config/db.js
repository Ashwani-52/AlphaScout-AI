import mongoose from 'mongoose';

export async function connectDB() {
  let mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.warn('⚠️ [DB] MONGO_URI is not defined in environment variables. Database connection skipped.');
    return;
  }

  // Programmatically encode special characters (like '@') in password
  try {
    if (mongoURI.startsWith('mongodb') && mongoURI.split('@').length > 2) {
      console.log('🔄 [DB] Unescaped "@" detected in MONGO_URI password. Escaping programmatically...');
      const prefixIndex = mongoURI.indexOf('://') + 3;
      const prefix = mongoURI.substring(0, prefixIndex);
      const rest = mongoURI.substring(prefixIndex);
      
      const lastAtIndex = rest.lastIndexOf('@');
      const credentials = rest.substring(0, lastAtIndex); // "username:password"
      const hostAndParams = rest.substring(lastAtIndex + 1); // "host/database?params..."
      
      const colonIndex = credentials.indexOf(':');
      if (colonIndex !== -1) {
        const username = credentials.substring(0, colonIndex);
        const password = credentials.substring(colonIndex + 1);
        const escapedPassword = encodeURIComponent(password);
        mongoURI = `${prefix}${username}:${escapedPassword}@${hostAndParams}`;
      }
    }
  } catch (err) {
    console.error('⚠️ [DB] Failed to programmatically sanitize MONGO_URI:', err.message);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('🔌 [DB] MongoDB Atlas connection established successfully.');
  } catch (error) {
    console.error('❌ [DB] MongoDB Atlas connection failed (server will remain running):', error.message);
  }
}
