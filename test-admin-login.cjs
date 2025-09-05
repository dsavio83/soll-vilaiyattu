const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dsavio83:p%40Dsavio%402025@ac-nzxqwpv-shard-00-00.mlihwos.mongodb.net:27017,ac-nzxqwpv-shard-00-01.mlihwos.mongodb.net:27017,ac-nzxqwpv-shard-00-02.mlihwos.mongodb.net:27017/soll-vilaiyattu?ssl=true&replicaSet=atlas-us1gjp-shard-0&authSource=admin&retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'user' },
  created_at: { type: Date, default: Date.now }
});

async function testAdminLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('Connected successfully!');

    const User = mongoose.model('User', userSchema);

    // Check existing users
    const users = await User.find({});
    console.log('Existing users:', users.map(u => ({ username: u.username, role: u.role })));

    // Test password verification
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      const isMatch = await bcrypt.compare('admin123', adminUser.password_hash);
      console.log('Password verification for admin123:', isMatch);
      
      if (!isMatch) {
        console.log('Updating admin password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.updateOne({ username: 'admin' }, { password_hash: hashedPassword });
        console.log('Admin password updated successfully!');
      }
    } else {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password_hash: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

testAdminLogin();