import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  _id: string;
  admission_number: string;
  name: string;
  class: string;
  division?: string;
  gender?: 'male' | 'female' | 'other';
  social_score: number;
  created_at: Date;
}

const StudentSchema: Schema = new Schema({
  admission_number: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  division: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  social_score: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);