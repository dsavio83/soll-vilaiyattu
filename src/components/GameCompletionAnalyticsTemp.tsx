import React from 'react';

interface GameCompletionAnalyticsProps {
  studentData: any;
  todayScore: any;
  onLogout: () => void;
  onViewLeaderboard: () => void;
}

const GameCompletionAnalytics = ({ studentData, todayScore, onLogout, onViewLeaderboard }: GameCompletionAnalyticsProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Game Complete!</h1>
        <p className="text-gray-600 mb-4">Score: {todayScore?.score || 0}</p>
        <p className="text-gray-600 mb-4">Words Found: {todayScore?.words_found || 0}</p>
        <div className="flex gap-4">
          <button
            onClick={onViewLeaderboard}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Leaderboard
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompletionAnalytics;