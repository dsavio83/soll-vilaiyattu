import mongoose from 'mongoose';

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

export const models = {
  users: mongoose.models.User || mongoose.model('User', UserSchema),
  students: mongoose.models.Student || mongoose.model('Student', StudentSchema),
  word_puzzle: mongoose.models.WordPuzzle || mongoose.model('WordPuzzle', WordPuzzleSchema),
  leaderboard_score: mongoose.models.LeaderboardScore || mongoose.model('LeaderboardScore', LeaderboardScoreSchema),
  user_scores: mongoose.models.UserScore || mongoose.model('UserScore', UserScoreSchema),
  ads_config: mongoose.models.AdsConfig || mongoose.model('AdsConfig', AdsConfigSchema)
};