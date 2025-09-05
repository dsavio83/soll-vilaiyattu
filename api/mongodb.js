import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Schemas
const schemas = {
  User: new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: 'user' },
    created_at: { type: Date, default: Date.now }
  }),
  Student: new mongoose.Schema({
    admission_number: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    class: { type: String, required: true },
    social_score: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
  }),
  WordPuzzle: new mongoose.Schema({
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
  }),
  UserScore: new mongoose.Schema({
    student_id: { type: String, required: true },
    found_words_list: [String],
    found_words_time: { type: String, default: '[]' },
    total_score: { type: Number, default: 0 },
    attempt_count: { type: Number, default: 0 },
    completion_count: { type: Number, default: 0 },
    game_start_time: { type: Number },
    last_played_date: { type: String, required: true }
  }),
  LeaderboardScore: new mongoose.Schema({
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
  }),
  AdsConfig: new mongoose.Schema({
    ad_unit_id: { type: String, required: true },
    ad_format: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
  })
};

const getModel = (name) => {
  return mongoose.models[name] || mongoose.model(name, schemas[name]);
};

const tableMap = {
  users: 'User',
  students: 'Student',
  word_puzzle: 'WordPuzzle',
  user_scores: 'UserScore',
  leaderboard_score: 'LeaderboardScore',
  ads_config: 'AdsConfig'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { action, table, query = {}, data, select, orderBy = [], limit = 0 } = req.body;

    if (!tableMap[table]) {
      return res.status(400).json({ error: `Unknown table: ${table}` });
    }

    const Model = getModel(tableMap[table]);

    if (query.id) {
      query._id = query.id;
      delete query.id;
    }

    switch (action) {
      case 'find':
        let findQuery = Model.find(query);
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
        const result = await Model.findOne(query).exec();
        return res.json({ data: result, error: null });

      case 'insert':
        const insertResult = await Model.insertMany(Array.isArray(data) ? data : [data]);
        return res.json({ data: insertResult, error: null });

      case 'update':
        const updateResult = await Model.updateMany(query, { $set: data });
        return res.json({ data: updateResult, error: null });

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

        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '1h' });

        return res.json({ data: { token }, error: null });

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}