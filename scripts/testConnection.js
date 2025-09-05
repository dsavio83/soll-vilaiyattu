const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dsavio83:p%40Dsavio%402025@ac-nzxqwpv-shard-00-00.mlihwos.mongodb.net:27017,ac-nzxqwpv-shard-00-01.mlihwos.mongodb.net:27017,ac-nzxqwpv-shard-00-02.mlihwos.mongodb.net:27017/soll-vilaiyattu?ssl=true&replicaSet=atlas-us1gjp-shard-0&authSource=admin&retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', MONGODB_URI.replace(/:[^:@]*@/, ':****@'));
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('✅ MongoDB connection successful!');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Test a simple query
    const stats = await mongoose.connection.db.stats();
    console.log(`💾 Database stats: ${stats.collections} collections, ${stats.objects} documents`);

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

testConnection();