import React from 'react';
import { Trophy, Clock, Target, TrendingUp, Award, LogOut, BarChart3 } from 'lucide-react';
import { getGraphemeClusters } from '@/utils/tamilUtils';

interface WordTiming {
  word: string;
  time: number;
  timestamp: number;
}

interface GameAnalysisPageProps {
  studentData: {
    name: string;
    class: string;
    admission_number: string;
  };
  todayScore: {
    score: number;
    words_found: number;
    time_taken: number;
    attempt_count: number;
  };
  foundWords: string[];
  wordTimings: WordTiming[];
  totalWords: number;
  onLogout: () => void;
  onViewLeaderboard: () => void;
}

const GameAnalysisPage: React.FC<GameAnalysisPageProps> = ({
  studentData,
  todayScore,
  foundWords,
  wordTimings,
  totalWords,
  onLogout,
  onViewLeaderboard
}) => {
  const accuracy = todayScore.attempt_count > 0 ? Math.round((todayScore.words_found / todayScore.attempt_count) * 100) : 0;
  const completionRate = Math.round((todayScore.words_found / totalWords) * 100);
  const avgTimePerWord = todayScore.words_found > 0 ? Math.round(todayScore.time_taken / todayScore.words_found) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceLevel = () => {
    if (completionRate === 100) return { level: 'Perfect!', color: 'from-yellow-400 to-orange-500', emoji: '🏆' };
    if (completionRate >= 80) return { level: 'Excellent', color: 'from-green-400 to-blue-500', emoji: '⭐' };
    if (completionRate >= 60) return { level: 'Good', color: 'from-blue-400 to-purple-500', emoji: '👍' };
    if (completionRate >= 40) return { level: 'Fair', color: 'from-purple-400 to-pink-500', emoji: '👌' };
    return { level: 'Keep Trying', color: 'from-pink-400 to-red-500', emoji: '💪' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Game Analysis</h1>
          <p className="text-gray-600">{studentData.name} • Class {studentData.class}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Performance Badge */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${performance.color} text-white rounded-2xl shadow-lg transform hover:scale-105 transition-transform`}>
          <span className="text-3xl">{performance.emoji}</span>
          <div>
            <div className="text-2xl font-bold">{performance.level}</div>
            <div className="text-sm opacity-90">{completionRate}% Complete</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-gray-600">Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{todayScore.score}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-600">Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{formatTime(todayScore.time_taken)}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{accuracy}%</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-gray-600">Attempts</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{todayScore.attempt_count}</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Words Found */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Words Found ({todayScore.words_found}/{totalWords})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {foundWords.map((word, index) => {
              const timing = wordTimings.find(t => t.word === word);
              return (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {word}
                  </span>
                  <div className="text-sm text-gray-600">
                    {timing ? formatTime(timing.time) : '--'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completion Rate</span>
                <span>{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Accuracy</span>
                <span>{accuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Additional Stats</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Avg. Time per Word</span>
                  <span>{avgTimePerWord}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Letters Found</span>
                  <span>{foundWords.reduce((sum, word) => sum + getGraphemeClusters(word).length, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onViewLeaderboard}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          View Leaderboard
        </button>
        <button
          onClick={onLogout}
          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
        >
          Play Tomorrow
        </button>
      </div>
    </div>
  );
};

export default GameAnalysisPage;