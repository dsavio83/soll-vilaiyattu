import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dsavio83:p%40Dsavio%402025@soll-vilaiyattu.mlihwos.mongodb.net/soll-vilaiyattu?retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]*@/, ':***@')); // Hide password

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 15000,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();