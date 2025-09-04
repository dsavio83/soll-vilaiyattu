import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Zap, Star, CheckCircle } from 'lucide-react';
import { getGraphemeClusters } from '@/utils/tamilUtils';

interface GameCompletionMessageProps {
  foundWords: string[];
  timeTaken: number;
  attemptCount: number;
  score: number;
  onViewLeaderboard: () => void;
}

const GameCompletionMessage = ({ 
  foundWords, 
  timeTaken, 
  attemptCount, 
  score, 
  onViewLeaderboard 
}: GameCompletionMessageProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // Calculate time until next midnight IST
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istNow = new Date(now.getTime() + istOffset);
      
      const nextMidnightIST = new Date(istNow);
      nextMidnightIST.setHours(24, 0, 0, 0);
      
      const nextMidnightLocal = new Date(nextMidnightIST.getTime() - istOffset);
      const timeUntilMidnight = Math.max(0, Math.floor((nextMidnightLocal.getTime() - now.getTime()) / 1000));
      
      return timeUntilMidnight;
    };

    setTimeLeft(calculateTimeUntilMidnight());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Completion Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-green-600 mb-3" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          🎉 வாழ்த்துகள்! 🎉
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          You have successfully completed today's puzzle!
        </p>
        <p className="text-sm text-gray-500" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          இன்றைய புதிரை வெற்றிகரமாக முடித்துவிட்டீர்கள்!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">{score}</div>
          <div className="text-sm text-blue-600 font-medium">Score</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1 font-mono">{formatTime(timeTaken)}</div>
          <div className="text-sm text-purple-600 font-medium">Time Taken</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">{foundWords.length}</div>
          <div className="text-sm text-green-600 font-medium">Words Found</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border border-orange-200">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-1">{attemptCount}</div>
          <div className="text-sm text-orange-600 font-medium">Attempts</div>
        </div>
      </div>

      {/* Found Words Display */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          கண்டுபிடித்த சொற்கள்
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {foundWords.map((word, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="text-lg font-bold text-gray-800 mb-1" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {word}
              </div>
              <div className="text-xs text-gray-500">
                {getGraphemeClusters(word).length} letters
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Game Countdown */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center mb-6">
        <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          அடுத்த விளையாட்டு
        </h3>
        <div className="text-3xl font-mono font-bold mb-2">
          {formatCountdown(timeLeft)}
        </div>
        <p className="text-indigo-200 text-sm">
          Time until next puzzle (12:00 AM IST)
        </p>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={onViewLeaderboard}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
        >
          🏆 View Leaderboard
        </button>
      </div>
    </div>
  );
};

export default GameCompletionMessage;