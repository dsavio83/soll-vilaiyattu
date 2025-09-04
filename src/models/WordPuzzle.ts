import mongoose, { Schema, Document } from 'mongoose';

export interface IWordPuzzle extends Document {
  _id: string;
  game_date: Date;
  center_letter: string;
  surrounding_letters: string[];
  words_2_letter: string[];
  words_3_letter: string[];
  words_4_letter: string[];
  words_5_letter: string[];
  words_6_letter: string[];
  words_7_letter: string[];
  created_at: Date;
}

const WordPuzzleSchema: Schema = new Schema({
  game_date: {
    type: Date,
    required: true,
    unique: true
  },
  center_letter: {
    type: String,
    required: true
  },
  surrounding_letters: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 6 letters']
  },
  words_2_letter: {
    type: [String],
    default: []
  },
  words_3_letter: {
    type: [String],
    default: []
  },
  words_4_letter: {
    type: [String],
    default: []
  },
  words_5_letter: {
    type: [String],
    default: []
  },
  words_6_letter: {
    type: [String],
    default: []
  },
  words_7_letter: {
    type: [String],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

function arrayLimit(val: string[]) {
  return val.length === 6;
}

export default mongoose.models.WordPuzzle || mongoose.model<IWordPuzzle>('WordPuzzle', WordPuzzleSchema);