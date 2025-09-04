import React from 'react';

interface MotivationProgressProps {
  foundWordsCount: number;
  totalWords: number;
  time: number;
  finalTime?: number;
  score: number;
  onViewWords: () => void;
  message: string;
  isGameComplete: boolean;
  attemptCount?: number;
}

const MotivationProgress = ({ foundWordsCount, totalWords, time, finalTime, score, onViewWords, message, isGameComplete, attemptCount = 0 }: MotivationProgressProps) => {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((foundWordsCount / totalWords) * 100, 100);

  // Create dots for progress visualization (total words + 1 for starting point)
  const totalDots = totalWords + 1;
  const dots = Array.from({ length: totalDots }, (_, index) => {
    const isActive = index <= foundWordsCount;
    return (
      <React.Fragment key={index}>
        <div 
          className={`w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0 ${
            isActive ? 'bg-pink-500' : 'bg-gray-300'
          }`}
        />
        {index < totalDots - 1 && (
          <div 
            className={`flex-1 h-0.5 transition-all duration-300 ${
              isActive ? 'bg-pink-500' : 'bg-gray-300'
            }`}
          />
        )}
      </React.Fragment>
    );
  });

  return (
    <div className="mb-4">
      {/* Desktop: Simple layout without card, no pills */}
      <div className="hidden md:block text-center">
        {/* Header Message */}
        <div className="text-lg font-bold text-gray-700 mb-3" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          {isGameComplete ? "ஆட்டம் முடிந்தது!" : message}
        </div>
        
        {/* Dot Progress Bar */}
        <div className="flex items-center justify-between mb-4 px-4">
          {dots}
        </div>
      </div>

      {/* Mobile: Layout with pills and view button */}
      <div className="md:hidden text-center">
        {/* Header Message */}
        <div className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          {isGameComplete ? "ஆட்டம் முடிந்தது!" : message}
        </div>
        
        {/* Dot Progress Bar */}
        <div className="flex items-center justify-between mb-3 px-4">
          {dots}
        </div>

        {/* Mobile Pills and View Button - Single Line */}
        <div className="flex items-center justify-center gap-1 mb-4 px-2">
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
            Words: {foundWordsCount}/{totalWords}
          </div>
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
            Score: {score}
          </div>
          <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
            Attempt: {attemptCount}
          </div>
          <button 
            onClick={onViewWords}
            className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors flex-shrink-0"
          >
            View Words
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotivationProgress;