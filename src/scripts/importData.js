import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://dsavio83:p%40Dsavio%402025@soll-vilaiyattu.mlihwos.mongodb.net/soll-vilaiyattu';

// Define schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const StudentSchema = new mongoose.Schema({
  admission_number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  division: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  social_score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const WordPuzzleSchema = new mongoose.Schema({
  game_date: { type: String, required: true, unique: true },
  center_letter: { type: String, required: true },
  surrounding_letters: { type: [String], required: true },
  words_2_letter: { type: [String], default: [] },
  words_3_letter: { type: [String], default: [] },
  words_4_letter: { type: [String], default: [] },
  words_5_letter: { type: [String], default: [] },
  words_6_letter: { type: [String], default: [] },
  words_7_letter: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now }
});

const LeaderboardScoreSchema = new mongoose.Schema({
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

const UserScoreSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true },
  found_words_time: { type: String },
  total_score: { type: Number, default: 0 },
  attempt_count: { type: Number, default: 0 },
  last_played_date: { type: String },
  completion_count: { type: Number, default: 0 }
});

const AdsConfigSchema = new mongoose.Schema({
  google_ads_id: { type: String, required: true },
  banner_enabled: { type: Boolean, default: true },
  interstitial_enabled: { type: Boolean, default: true },
  rewarded_enabled: { type: Boolean, default: false },
  ads_frequency: { type: Number, default: 3 },
  show_ads_after_login: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const importDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create models
    const User = mongoose.model('User', UserSchema);
    const Student = mongoose.model('Student', StudentSchema);
    const WordPuzzle = mongoose.model('WordPuzzle', WordPuzzleSchema);
    const LeaderboardScore = mongoose.model('LeaderboardScore', LeaderboardScoreSchema);
    const UserScore = mongoose.model('UserScore', UserScoreSchema);
    const AdsConfig = mongoose.model('AdsConfig', AdsConfigSchema);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await WordPuzzle.deleteMany({});
    await LeaderboardScore.deleteMany({});
    await UserScore.deleteMany({});
    await AdsConfig.deleteMany({});

    // 1. Insert Admin Users
    console.log('👤 Creating admin users...');
    const adminPassword = await bcrypt.hash('admin', 10);
    await User.create({
      username: 'admin',
      password_hash: adminPassword
    });

    // 2. Insert Students Data (Tamil names and realistic data)
    console.log('🎓 Creating student records...');
    const students = [
      {
        admission_number: 'ADM001',
        name: 'அருண் குமார்',
        class: '10',
        division: 'A',
        gender: 'male',
        social_score: 150
      },
      {
        admission_number: 'ADM002',
        name: 'பிரியா சுந்தர்',
        class: '10',
        division: 'A',
        gender: 'female',
        social_score: 200
      },
      {
        admission_number: 'ADM003',
        name: 'கார்த்திக் ராஜ்',
        class: '9',
        division: 'B',
        gender: 'male',
        social_score: 175
      },
      {
        admission_number: 'ADM004',
        name: 'தீபிகா முருகன்',
        class: '9',
        division: 'B',
        gender: 'female',
        social_score: 225
      },
      {
        admission_number: 'ADM005',
        name: 'விஜய் பாலன்',
        class: '11',
        division: 'A',
        gender: 'male',
        social_score: 180
      },
      {
        admission_number: 'ADM006',
        name: 'ஸ்ரீதேவி நாயர்',
        class: '11',
        division: 'B',
        gender: 'female',
        social_score: 195
      },
      {
        admission_number: 'ADM007',
        name: 'ராஜேஷ் குமார்',
        class: '8',
        division: 'A',
        gender: 'male',
        social_score: 120
      },
      {
        admission_number: 'ADM008',
        name: 'கவிதா ராமன்',
        class: '8',
        division: 'B',
        gender: 'female',
        social_score: 140
      },
      {
        admission_number: 'ADM009',
        name: 'சுரேஷ் பாபு',
        class: '12',
        division: 'A',
        gender: 'male',
        social_score: 250
      },
      {
        admission_number: 'ADM010',
        name: 'மீனா லக்ஷ்மி',
        class: '12',
        division: 'B',
        gender: 'female',
        social_score: 275
      }
    ];

    await Student.insertMany(students);

    // 3. Insert Word Puzzle Games (Multiple days)
    console.log('🧩 Creating word puzzle games...');
    const today = new Date();
    const wordPuzzles = [];

    // Today's game
    wordPuzzles.push({
      game_date: today.toISOString().split('T')[0],
      center_letter: 'ல்',
      surrounding_letters: ['ப', 'க', 'ப்', 'ம', 'ட', 'ட்'],
      words_2_letter: ['கல்', 'பல்', 'மல்'],
      words_3_letter: ['பகல்', 'கடல்', 'மடல்'],
      words_4_letter: ['கப்பல்', 'மல்லல்'],
      words_5_letter: ['கல்லல்'],
      words_6_letter: [],
      words_7_letter: ['பட்டப்பகல்']
    });

    // Tomorrow's game
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    wordPuzzles.push({
      game_date: tomorrow.toISOString().split('T')[0],
      center_letter: 'தி',
      surrounding_letters: ['சை', 'க', 'ய', 'ரு', 'றி', 'வி'],
      words_2_letter: ['திசை', 'திரு', 'வித', 'யதி', 'கதி'],
      words_3_letter: ['கருவி', 'திருவி', 'யதிர்'],
      words_4_letter: ['திசைகள்'],
      words_5_letter: [],
      words_6_letter: [],
      words_7_letter: ['திசையறிகருவி']
    });

    // Yesterday's game
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    wordPuzzles.push({
      game_date: yesterday.toISOString().split('T')[0],
      center_letter: 'ர்',
      surrounding_letters: ['க', 'ம', 'ண', 'த', 'வ', 'ள'],
      words_2_letter: ['கர்', 'மர்', 'வர்'],
      words_3_letter: ['கமர்', 'மணர்', 'வளர்'],
      words_4_letter: ['கமலர்', 'மணவர்'],
      words_5_letter: ['கமலவர்'],
      words_6_letter: [],
      words_7_letter: ['கமலமணவர்']
    });

    await WordPuzzle.insertMany(wordPuzzles);

    // 4. Insert Sample User Scores
    console.log('📊 Creating user scores...');
    const userScores = [
      {
        student_id: students[0]._id || 'student1',
        found_words_time: JSON.stringify({
          'கல்': 1500,
          'பல்': 2300,
          'பகல்': 4500
        }),
        total_score: 150,
        attempt_count: 15,
        last_played_date: today.toISOString().split('T')[0],
        completion_count: 3
      },
      {
        student_id: students[1]._id || 'student2',
        found_words_time: JSON.stringify({
          'கல்': 1200,
          'பல்': 1800,
          'பகல்': 3200,
          'கடல்': 5500
        }),
        total_score: 200,
        attempt_count: 12,
        last_played_date: today.toISOString().split('T')[0],
        completion_count: 5
      }
    ];

    await UserScore.insertMany(userScores);

    // 5. Insert Sample Leaderboard Scores
    console.log('🏆 Creating leaderboard scores...');
    const leaderboardScores = [
      {
        student_id: students[0]._id || 'student1',
        admission_number: 'ADM001',
        name: 'அருண் குமார்',
        class: '10',
        score: 150,
        time_taken: 300, // 5 minutes
        words_found: 5,
        found_words: 'கல்,பல்,பகல்,கடல்,கப்பல்',
        found_words_time: JSON.stringify({
          'கல்': 1500,
          'பல்': 2300,
          'பகல்': 4500,
          'கடல்': 6200,
          'கப்பல்': 8900
        }),
        complete_game: true,
        attempt_count: 15,
        game_date: today.toISOString().split('T')[0]
      },
      {
        student_id: students[1]._id || 'student2',
        admission_number: 'ADM002',
        name: 'பிரியா சுந்தர்',
        class: '10',
        score: 200,
        time_taken: 240, // 4 minutes
        words_found: 6,
        found_words: 'கல்,பல்,மல்,பகல்,கடல்,மடல்',
        found_words_time: JSON.stringify({
          'கல்': 1200,
          'பல்': 1800,
          'மல்': 2500,
          'பகல்': 3200,
          'கடல்': 4100,
          'மடல்': 5500
        }),
        complete_game: true,
        attempt_count: 12,
        game_date: today.toISOString().split('T')[0]
      },
      {
        student_id: students[2]._id || 'student3',
        admission_number: 'ADM003',
        name: 'கார்த்திக் ராஜ்',
        class: '9',
        score: 175,
        time_taken: 360, // 6 minutes
        words_found: 4,
        found_words: 'கல்,பல்,பகல்,கடல்',
        found_words_time: JSON.stringify({
          'கல்': 2000,
          'பல்': 3500,
          'பகல்': 5200,
          'கடல்': 7800
        }),
        complete_game: true,
        attempt_count: 18,
        game_date: today.toISOString().split('T')[0]
      }
    ];

    await LeaderboardScore.insertMany(leaderboardScores);

    // 6. Insert Ads Configuration
    console.log('📱 Creating ads configuration...');
    await AdsConfig.create({
      google_ads_id: 'ca-pub-5614525087268742',
      banner_enabled: true,
      interstitial_enabled: true,
      rewarded_enabled: false,
      ads_frequency: 3,
      show_ads_after_login: true
    });

    console.log('✅ Database import completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 Admin Users: 1 (username: admin, password: admin)`);
    console.log(`🎓 Students: ${students.length}`);
    console.log(`🧩 Word Puzzles: ${wordPuzzles.length} (yesterday, today, tomorrow)`);
    console.log(`📊 User Scores: ${userScores.length}`);
    console.log(`🏆 Leaderboard Scores: ${leaderboardScores.length}`);
    console.log(`📱 Ads Config: 1`);
    console.log('\n🚀 You can now start the application!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing database:', error);
    process.exit(1);
  }
};

importDatabase();