import mongoose from 'mongoose';

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
  game_date: { type: Date, required: true, unique: true },
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

const initializeDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create models
    const User = mongoose.model('User', UserSchema);
    const Student = mongoose.model('Student', StudentSchema);
    const WordPuzzle = mongoose.model('WordPuzzle', WordPuzzleSchema);
    const AdsConfig = mongoose.model('AdsConfig', AdsConfigSchema);

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await WordPuzzle.deleteMany({});
    await AdsConfig.deleteMany({});

    // Insert default admin user (password is 'admin' hashed)
    await User.create({
      username: 'admin',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    });

    // Insert sample students data
    const students = [
      {
        admission_number: 'ADM001',
        name: 'அருண் குமார்',
        class: '10',
        division: 'A',
        gender: 'male'
      },
      {
        admission_number: 'ADM002',
        name: 'பிரியா சுந்தர்',
        class: '10',
        division: 'A',
        gender: 'female'
      },
      {
        admission_number: 'ADM003',
        name: 'கார்த்திக் ராஜ்',
        class: '9',
        division: 'B',
        gender: 'male'
      },
      {
        admission_number: 'ADM004',
        name: 'தீபிகா முருகன்',
        class: '9',
        division: 'B',
        gender: 'female'
      },
      {
        admission_number: 'ADM005',
        name: 'விஜய் பாலன்',
        class: '11',
        division: 'A',
        gender: 'male'
      }
    ];

    await Student.insertMany(students);

    // Insert sample word puzzle data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const wordPuzzles = [
      {
        game_date: today,
        center_letter: 'ல்',
        surrounding_letters: ['ப', 'க', 'ப்', 'ப', 'ட', 'ட்'],
        words_2_letter: ['கல்', 'பல்'],
        words_3_letter: ['பகல்', 'கடல்'],
        words_4_letter: ['கப்பல்'],
        words_5_letter: [],
        words_6_letter: [],
        words_7_letter: ['பட்டப்பகல்']
      },
      {
        game_date: tomorrow,
        center_letter: 'தி',
        surrounding_letters: ['சை', 'க', 'ய', 'ரு', 'றி', 'வி'],
        words_2_letter: ['திசை', 'திரு', 'வித', 'யதி', 'கதி'],
        words_3_letter: ['கருவி', 'கடல்'],
        words_4_letter: [],
        words_5_letter: [],
        words_6_letter: [],
        words_7_letter: ['திசையறிகருவி']
      }
    ];

    await WordPuzzle.insertMany(wordPuzzles);

    // Insert default ads configuration
    await AdsConfig.create({
      google_ads_id: 'ca-pub-5614525087268742',
      banner_enabled: true,
      interstitial_enabled: true,
      rewarded_enabled: false,
      ads_frequency: 3,
      show_ads_after_login: true
    });

    console.log('Database initialized successfully with sample data');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();