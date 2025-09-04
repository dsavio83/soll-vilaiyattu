import mongoose, { Schema, Document } from 'mongoose';

export interface IPushSubscription extends Document {
  _id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  created_at: Date;
}

const PushSubscriptionSchema: Schema = new Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  p256dh: {
    type: String,
    required: true
  },
  auth: {
    type: String,
    required: true
  },
  user_agent: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.PushSubscription || mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);