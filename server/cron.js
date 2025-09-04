import cron from 'node-cron';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dsavio83:p%40Dsavio%402025@soll-vilaiyattu.mlihwos.mongodb.net/soll-vilaiyattu?retryWrites=true&w=majority';

import { models } from './models.js';

const resetLeaderboard = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    await models.leaderboard_score.deleteMany({});
    console.log('Leaderboard reset successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    mongoose.connection.close();
  }
};

// Schedule the task to run at midnight every day
cron.schedule('0 0 * * *', () => {
  console.log('Running leaderboard reset cron job...');
  resetLeaderboard();
});

console.log('Cron job for leaderboard reset scheduled.');
