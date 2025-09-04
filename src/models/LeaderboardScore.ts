import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaderboardScore extends Document {
  _id: string;
  student_id: string;
  admission_number: string;
  name: string;
  class: string;
  score: number;
  time_taken: number;
  words_found: number;
  found_words?: string;
  found_words_time?: string;
  complete_game: boolean;
  attempt_count: number;
  game_date: Date;
  completed_at: Date;
}

const LeaderboardScoreSchema: Schema = new Schema({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  admission_number: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  time_taken: {
    type: Number,
    required: true
  },
  words_found: {
    type: Number,
    required: true,
    default: 0
  },
  found_words: {
    type: String
  },
  found_words_time: {
    type: String
  },
  complete_game: {
    type: Boolean,
    default: false
  },
  attempt_count: {
    type: Number,
    default: 0
  },
  game_date: {
    type: Date,
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  completed_at: {
    type: Date,
    default: Date.now
  }
});

// Create compound unique index for student_id and game_date
LeaderboardScoreSchema.index({ student_id: 1, game_date: 1 }, { unique: true });

export default mongoose.models.LeaderboardScore || mongoose.model<ILeaderboardScore>('LeaderboardScore', LeaderboardScoreSchema);