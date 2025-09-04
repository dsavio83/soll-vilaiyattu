import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  password_hash: string;
  created_at: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);