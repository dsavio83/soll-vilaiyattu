import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import WordPuzzle from '@/models/WordPuzzle';
import AdsConfig from '@/models/AdsConfig';

const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

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
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export default initializeDatabase;