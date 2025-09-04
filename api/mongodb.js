import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dsavio83:p%40Dsavio%402025@soll-vilaiyattu.mlihwos.mongodb.net/soll-vilaiyattu?retryWrites=true&w=majority';

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

// Create models
const models = {
  users: mongoose.models.User || mongoose.model('User', UserSchema),
  students: mongoose.models.Student || mongoose.model('Student', StudentSchema),
  word_puzzle: mongoose.models.WordPuzzle || mongoose.model('WordPuzzle', WordPuzzleSchema),
  leaderboard_score: mongoose.models.LeaderboardScore || mongoose.model('LeaderboardScore', LeaderboardScoreSchema),
  user_scores: mongoose.models.UserScore || mongoose.model('UserScore', UserScoreSchema),
  ads_config: mongoose.models.AdsConfig || mongoose.model('AdsConfig', AdsConfigSchema)
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { action, table, query = {}, data, select, orderBy = [], limit = 0 } = req.body;

    console.log('Received action:', action);

    if (!models[table]) {
      return res.status(400).json({ error: `Unknown table: ${table}` });
    }

    const Model = models[table];

    switch (action) {
      case 'find':
        let findQuery = Model.find(query);
        
        if (select && select !== '*') {
          findQuery = findQuery.select(select);
        }
        
        if (orderBy.length > 0) {
          const sortObj = {};
          orderBy.forEach(order => {
            sortObj[order.field] = order.ascending ? 1 : -1;
          });
          findQuery = findQuery.sort(sortObj);
        }
        
        if (limit > 0) {
          findQuery = findQuery.limit(limit);
        }
        
        const results = await findQuery.exec();
        return res.json({ data: results, error: null });

      case 'findOne':
        let findOneQuery = Model.findOne(query);
        
        if (select && select !== '*') {
          findOneQuery = findOneQuery.select(select);
        }
        
        if (orderBy.length > 0) {
          const sortObj = {};
          orderBy.forEach(order => {
            sortObj[order.field] = order.ascending ? 1 : -1;
          });
          findOneQuery = findOneQuery.sort(sortObj);
        }
        
        const result = await findOneQuery.exec();
        return res.json({ data: result, error: null });

      case 'insert':
        try {
          const insertResult = await Model.insertMany(data);
          return res.json({ data: insertResult, error: null });
        } catch (e) {
          console.error(`Error inserting into ${table}:`, e);
          throw e;
        }

      case 'update':
        try {
          const updateResult = await Model.updateMany(query, { $set: data });
          return res.json({ data: updateResult, error: null });
        } catch (e) {
          console.error(`Error updating ${table}:`, e);
          throw e;
        }

      case 'upsert':
        const upsertResult = await Model.findOneAndUpdate(query, data, { 
          upsert: true, 
          new: true 
        });
        return res.json({ data: upsertResult, error: null });

      case 'delete':
        const deleteResult = await Model.deleteMany(query);
        return res.json({ data: deleteResult, error: null });

      case 'login':
        const { username, password } = data;
        const user = await Model.findOne({ username });

        if (!user) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'your-default-secret', { expiresIn: '1h' });

        return res.json({ data: { token }, error: null });

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('MongoDB API Error:', JSON.stringify(error, null, 2));
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
}