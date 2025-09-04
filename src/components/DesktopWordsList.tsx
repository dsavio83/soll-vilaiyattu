import React, { useState } from 'react';
import { getGraphemeClusters } from '@/utils/tamilUtils';
import { Eye, EyeOff, Trophy } from 'lucide-react';
import GoogleAds from './GoogleAds';
import LeaderboardModal from './LeaderboardModal';

interface DesktopWordsListProps {
  allValidWords: string[];
  foundWords: string[];
  message: string;
  isGameComplete: boolean;
  attemptCount?: number;
  score?: number;
}

const DesktopWordsList = ({
  allValidWords,
  foundWords,
  message,
  isGameComplete,
  attemptCount = 0,
  score = 0
}: DesktopWordsListProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const sortedWords = [...allValidWords].sort((a, b) => getGraphemeClusters(b).length - getGraphemeClusters(a).length);
  
  // Create dots for progress visualization (total words + 1 for starting point)
  const totalDots = allValidWords.length + 1;
  const dots = Array.from({ length: totalDots }, (_, index) => {
    const isActive = index <= foundWords.length;
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

  const renderWordBlocks = (word: string) => {
    const graphemes = getGraphemeClusters(word);
    const isFound = foundWords.includes(word);
    
    return (
      <div key={word} className="flex gap-1 mb-2">
        {graphemes.map((grapheme, index) => (
          <div
            key={`${word}-${index}`}
            className={`
              w-8 h-8 text-sm
              flex items-center justify-center rounded-lg font-bold shadow-md border-2 transition-all duration-300
              ${isFound 
                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-300 shadow-lg' 
                : 'bg-gray-200 text-gray-500 border-gray-300'
              }
            `}
            style={{ 
              fontFamily: 'Noto Sans Tamil, sans-serif',
              textShadow: isFound ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
              lineHeight: '1',
              minWidth: '2rem',
              minHeight: '2rem'
            }}
          >
            <span className="flex items-center justify-center w-full h-full">
              {isFound ? grapheme : ''}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg sticky top-4">
      {/* Progress and Message Section */}
      <div className="p-4 border-b border-gray-200 text-center">
        {/* Header Message */}
        <div className="text-lg font-bold text-gray-700 mb-3" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          {isGameComplete ? "ஆட்டம் முடிந்தது!" : message}
        </div>
        
        {/* Dot Progress Bar */}
        <div className="flex items-center justify-between mb-4 px-4">
          {dots}
        </div>
      </div>

      {/* Stats Pills */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Score: {score}
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Words: {foundWords.length} / {allValidWords.length}
          </div>
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            Attempts: {attemptCount}
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      {/* <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <button
          onClick={() => setShowLeaderboard(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 font-medium"
        >
          <Trophy className="w-4 h-4" />
          View Leaderboard
        </button>
      </div> */}

      {/* Banner Ad */}
      <div className="p-2 border-b border-gray-200">
        <GoogleAds 
          adSlot="6833809490"
          adFormat="fluid"
          adLayoutKey="-fd+b+v-54+5s"
          style={{ minHeight: '90px' }}
        />
      </div>

      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800">Words List</h3>
        </div>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={isVisible ? 'Hide words list' : 'Show words list'}
        >
          {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Words list content */}
      {isVisible && (
        <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="space-y-1">
            {sortedWords.map(word => renderWordBlocks(word))}
          </div>
        </div>
      )}
      
      {/* Collapsed state message */}
      {!isVisible && (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">Words list hidden</p>
        </div>
      )}

      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentUserId={undefined}
      />
    </div>
  );
};

export default DesktopWordsList;