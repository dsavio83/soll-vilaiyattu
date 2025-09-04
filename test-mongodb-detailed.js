import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]*@/, ':***@')); // Hide password

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Increased timeout
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB Atlas connection successful!');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      test: String,
      timestamp: { type: Date, default: Date.now }
    });
    const TestModel = mongoose.model('Test', TestSchema);
    
    const testDoc = await TestModel.create({ test: 'Connection test' });
    console.log('✅ Test document created:', testDoc._id);
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.reason) {
      console.error('Error reason:', error.reason);
    }
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    // Additional debugging info
    console.error('Full error:', error);
    
    process.exit(1);
  }
}

testConnection();