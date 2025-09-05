const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dsavio83:p%40Dsavio%402025@ac-nzxqwpv-shard-00-00.mlihwos.mongodb.net:27017,ac-nzxqwpv-shard-00-01.mlihwos.mongodb.net:27017,ac-nzxqwpv-shard-00-02.mlihwos.mongodb.net:27017/soll-vilaiyattu?ssl=true&replicaSet=atlas-us1gjp-shard-0&authSource=admin&retryWrites=true&w=majority';

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'user' },
  created_at: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  admission_number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  division: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  social_score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const wordPuzzleSchema = new mongoose.Schema({
  game_date: { type: String, required: true, unique: true },
  center_letter: { type: String, required: true },
  surrounding_letters: [String],
  words_2_letter: [String],
  words_3_letter: [String],
  words_4_letter: [String],
  words_5_letter: [String],
  words_6_letter: [String],
  words_7_letter: [String],
  created_at: { type: Date, default: Date.now }
});

const userScoresSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  found_words_list: [String],
  found_words_time: { type: String, default: '[]' },
  total_score: { type: Number, default: 0 },
  attempt_count: { type: Number, default: 0 },
  completion_count: { type: Number, default: 0 },
  game_start_time: { type: Number },
  last_played_date: { type: String, required: true }
});

const leaderboardScoreSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  admission_number: { type: String, required: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  score: { type: Number, required: true },
  time_taken: { type: Number, required: true },
  words_found: { type: Number, required: true },
  found_words: { type: String },
  found_words_time: { type: String },
  complete_game: { type: Boolean, default: true },
  attempt_count: { type: Number, default: 0 },
  game_date: { type: String, required: true },
  completed_at: { type: Date, default: Date.now }
});

const adsConfigSchema = new mongoose.Schema({
  ad_unit_id: { type: String, required: true },
  ad_format: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  created_at: { type: Date, default: Date.now }
});

async function resetDatabase() {
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

    console.log('Connected to MongoDB successfully!');

    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections to drop...`);

    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    // Create models
    const User = mongoose.model('User', userSchema);
    const Student = mongoose.model('Student', studentSchema);
    const WordPuzzle = mongoose.model('WordPuzzle', wordPuzzleSchema);
    const UserScore = mongoose.model('UserScore', userScoresSchema);
    const LeaderboardScore = mongoose.model('LeaderboardScore', leaderboardScoreSchema);
    const AdsConfig = mongoose.model('AdsConfig', adsConfigSchema);
    const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);

    console.log('Creating fresh collections...');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password_hash: hashedPassword,
      role: 'admin'
    });
    console.log('Created admin user (username: admin, password: admin123)');

    // Create sample student
    await Student.create({
      admission_number: 'STU001',
      name: 'Sample Student',
      class: '10',
      division: 'A',
      gender: 'male',
      social_score: 0
    });
    console.log('Created sample student');

    // Create sample word puzzle for today
    const today = new Date().toISOString().split('T')[0];
    await WordPuzzle.create({
      game_date: today,
      center_letter: 'க',
      surrounding_letters: ['ர', 'ம', 'ல', 'த', 'ன', 'வ'],
      words_2_letter: ['கர', 'கம'],
      words_3_letter: ['கரம', 'கமல'],
      words_4_letter: ['கரவம', 'கமலம'],
      words_5_letter: ['கரவலம'],
      words_6_letter: [],
      words_7_letter: []
    });
    console.log('Created sample word puzzle for today');

    // Create default ads config
    await AdsConfig.create({
      ad_unit_id: 'ca-app-pub-3940256099942544/6300978111',
      ad_format: 'banner',
      is_active: true
    });
    console.log('Created default ads configuration');

    console.log('\n✅ Database reset completed successfully!');
    console.log('📊 Collections created:');
    console.log('  - users (with admin user)');
    console.log('  - students (with sample student)');
    console.log('  - wordpuzzles (with today\'s puzzle)');
    console.log('  - userscores (empty)');
    console.log('  - leaderboardscores (empty)');
    console.log('  - adsconfigs (with default config)');
    console.log('  - pushsubscriptions (empty)');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

resetDatabase();