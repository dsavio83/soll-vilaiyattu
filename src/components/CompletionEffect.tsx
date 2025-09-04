import React, { useState, useEffect } from 'react';

interface CompletionEffectProps {
  isOpen: boolean;
  onClose: () => void;
  timeTaken: number;
  score: number;
  attemptCount?: number;
  totalScore: number;
}

const CompletionEffect = ({ isOpen, onClose, timeTaken, score, attemptCount = 0, totalScore }: CompletionEffectProps) => {
  const [showBalloons, setShowBalloons] = useState(false);
  const [showCoins, setShowCoins] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowBalloons(true);
      setTimeout(() => setShowCoins(true), 1000);
    } else {
      setShowBalloons(false);
      setShowCoins(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Balloons */}
      {showBalloons && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-8 h-10 rounded-full animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Floating coins */}
      {showCoins && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
            நன்று சிறப்பாக செயல்பட்டீர்கள்!
          </h2>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-500 font-medium">Score</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-purple-600">{formatTime(timeTaken)}</div>
              <div className="text-sm text-gray-500 font-medium">Time</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-orange-600">{attemptCount}</div>
              <div className="text-sm text-gray-500 font-medium">Attempts</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-4 shadow-md mb-4">
            <div className="text-white text-center">
              <div className="text-lg font-bold">+5 Points Earned! 🎯</div>
              <div className="text-sm opacity-90">Complete game bonus</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-xl font-bold text-green-600">
              Total Score: {totalScore + 5}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-bold text-lg shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CompletionEffect;