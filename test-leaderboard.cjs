const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dsavio83:p%40Dsavio%402025@ac-nzxqwpv-shard-00-00.mlihwos.mongodb.net:27017,ac-nzxqwpv-shard-00-01.mlihwos.mongodb.net:27017,ac-nzxqwpv-shard-00-02.mlihwos.mongodb.net:27017/soll-vilaiyattu?ssl=true&replicaSet=atlas-us1gjp-shard-0&authSource=admin&retryWrites=true&w=majority';

const leaderboardScoreSchema = new mongoose.Schema({
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

async function testLeaderboardInsert() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('Connected successfully!');

    const LeaderboardScore = mongoose.model('LeaderboardScore', leaderboardScoreSchema);

    // Test data
    const testData = {
      student_id: '507f1f77bcf86cd799439011', // Valid ObjectId format
      admission_number: 'STU001',
      name: 'Test Student',
      class: '10',
      score: 15,
      time_taken: 120,
      words_found: 5,
      found_words: JSON.stringify(['கல', 'கம', 'கர']),
      found_words_time: JSON.stringify([]),
      complete_game: true,
      attempt_count: 1,
      game_date: new Date().toISOString().split('T')[0]
    };

    console.log('Inserting test data:', testData);

    const result = await LeaderboardScore.create(testData);
    console.log('✅ Successfully inserted:', result._id);

    // Clean up test data
    await LeaderboardScore.deleteOne({ _id: result._id });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

testLeaderboardInsert();