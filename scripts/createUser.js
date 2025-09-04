import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dsavio83:p%40Dsavio%402025@soll-vilaiyattu.mlihwos.mongodb.net/soll-vilaiyattu?retryWrites=true&w=majority';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: node scripts/createUser.js <username> <password>');
  process.exit(1);
}

async function createUser() {
  try {
    await mongoose.connect(MONGODB_URI);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password_hash });
    await newUser.save();

    console.log(`User ${username} created successfully.`);
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating user:', error);
    mongoose.connection.close();
  }
}

createUser();
