const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI;

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority',
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    cachedConnection = connection;
    return connection;
  } catch (error) {
    throw new Error('Database connection failed: ' + error.message);
  }
};

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

// Models
const getModel = (name, schema) => {
  return mongoose.models[name] || mongoose.model(name, schema);
};

const models = {
  users: () => getModel('User', userSchema),
  students: () => getModel('Student', studentSchema),
  word_puzzle: () => getModel('WordPuzzle', wordPuzzleSchema),
  user_scores: () => getModel('UserScore', userScoresSchema),
  leaderboard_score: () => getModel('LeaderboardScore', leaderboardScoreSchema),
  ads_config: () => getModel('AdsConfig', adsConfigSchema)
};

export default async function handler(req, res) {
  // Set CORS headers
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

    if (query.id) {
      query._id = query.id;
      delete query.id;
    }

    if (!models[table]) {
      return res.status(400).json({ error: `Unknown table: ${table}` });
    }

    const Model = models[table]();

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

        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'your-default-secret', { expiresIn: '1h' });

        return res.json({ data: { token }, error: null });

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}