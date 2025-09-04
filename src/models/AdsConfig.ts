import mongoose, { Schema, Document } from 'mongoose';

export interface IAdsConfig extends Document {
  _id: string;
  google_ads_id: string;
  banner_enabled: boolean;
  interstitial_enabled: boolean;
  rewarded_enabled: boolean;
  ads_frequency: number;
  show_ads_after_login: boolean;
  created_at: Date;
  updated_at: Date;
}

const AdsConfigSchema: Schema = new Schema({
  google_ads_id: {
    type: String,
    required: true
  },
  banner_enabled: {
    type: Boolean,
    default: true
  },
  interstitial_enabled: {
    type: Boolean,
    default: true
  },
  rewarded_enabled: {
    type: Boolean,
    default: false
  },
  ads_frequency: {
    type: Number,
    default: 3
  },
  show_ads_after_login: {
    type: Boolean,
    default: true
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
AdsConfigSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.models.AdsConfig || mongoose.model<IAdsConfig>('AdsConfig', AdsConfigSchema);