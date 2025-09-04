import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import './server/cron.js';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dsavio83:p%40Dsavio%402025@soll-vilaiyattu.mlihwos.mongodb.net/soll-vilaiyattu?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());

import { models } from './server/models.js';

// Global flag to track MongoDB connection status
let isMongoConnected = false;

// Connect to MongoDB with improved configuration
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 15000, // 15 seconds
  socketTimeoutMS: 20000, // 20 seconds
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    isMongoConnected = true;
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will continue without MongoDB. Some features may be limited.');
    isMongoConnected = false;
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  isMongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isMongoConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
  isMongoConnected = true;
});

// ...existing code...
app.post('/game/complete', async (req, res) => {
  const { userId, score, foundWords, timeTaken } = req.body;
  const existing = await Leaderboard.findOne({ userId });
  if (existing) {
    // Already saved, show previous details
    return res.json({
      message: 'Game already completed!',
      timeTaken: existing.timeTaken,
      foundWords: existing.foundWords,
      playedAt: existing.playedAt,
    });
  }
  // Save new result
  const result = await Leaderboard.create({
    userId,
    score,
    foundWords,
    timeTaken,
    playedAt: new Date(),
  });
  res.json({ message: 'Game saved!', ...result._doc });
});
// ...existing code...

// API endpoint
app.post('/api/mongodb', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!isMongoConnected) {
      return res.status(503).json({ 
        error: 'Database connection unavailable. Please check your network connection or contact support.',
        code: 'DB_UNAVAILABLE'
      });
    }

    const { action, table, query = {}, data, select, orderBy = [], limit = 0 } = req.body;

    if (query.id) {
      query._id = query.id;
      delete query.id;
    }

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
        if (table === 'word_puzzle') {
          console.log('Attempting to insert word_puzzle with data:', JSON.stringify(data, null, 2));
        }
        try {
          const insertResult = await Model.insertMany(data);
          return res.json({ data: insertResult, error: null });
        } catch (e) {
          console.error(`[Custom Log] Error inserting into ${table}:`, JSON.stringify(e, null, 2));
          throw e;
        }

      case 'update':
        if (table === 'word_puzzle') {
          console.log(`Attempting to update word_puzzle with query: ${JSON.stringify(query)} and data: ${JSON.stringify(data, null, 2)}`);
        }
        try {
          const updateResult = await Model.updateMany(query, { $set: data });
          return res.json({ data: updateResult, error: null });
        } catch (e) {
          console.error(`[Custom Log] Error updating ${table}:`, JSON.stringify(e, null, 2));
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
    console.error('MongoDB API Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Soll Vilaiyattu API Server',
    status: 'running',
    mongodb: isMongoConnected ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});