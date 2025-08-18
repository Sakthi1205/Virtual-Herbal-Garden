import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected to Herbal_Garden database');
    console.log('Database Name:', mongoose.connection.db.databaseName);
    
    // List collections to verify notes collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}
