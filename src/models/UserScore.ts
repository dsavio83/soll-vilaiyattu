import mongoose, { Schema, Document } from 'mongoose';

export interface IUserScore extends Document {
  _id: string;
  student_id: string;
  total_score: number;
  last_played_date?: Date;
  streak_days: number;
  found_words_time?: string;
  attempt_count: number;
  created_at: Date;
  updated_at: Date;
}

const UserScoreSchema: Schema = new Schema({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  total_score: {
    type: Number,
    required: true,
    default: 0
  },
  last_played_date: {
    type: Date
  },
  streak_days: {
    type: Number,
    required: true,
    default: 0
  },
  found_words_time: {
    type: String
  },
  attempt_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
UserScoreSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.models.UserScore || mongoose.model<IUserScore>('UserScore', UserScoreSchema);