import React, { useState, useEffect } from 'react';
import { getGraphemeClusters } from '@/utils/tamilUtils';

interface WordBlocksListProps {
  allValidWords: string[];
  foundWords: string[];
  isSmall?: boolean;
  attemptCount?: number;
}

const WordBlocksList = ({ allValidWords, foundWords, isSmall = false, attemptCount = 0 }: WordBlocksListProps) => {
  const sortedWords = [...allValidWords].sort((a, b) => getGraphemeClusters(b).length - getGraphemeClusters(a).length);
  const [flippingWords, setFlippingWords] = useState<Set<string>>(new Set());
  const [previousFoundWords, setPreviousFoundWords] = useState<string[]>([]);

  // Detect newly found words and trigger flip animation
  useEffect(() => {
    const newWords = foundWords.filter(word => !previousFoundWords.includes(word));
    if (newWords.length > 0) {
      setFlippingWords(new Set(newWords));
      // Remove flip animation after animation completes
      setTimeout(() => {
        setFlippingWords(new Set());
      }, 600);
    }
    setPreviousFoundWords([...foundWords]);
  }, [foundWords]);

  const renderWordBlocks = (word: string) => {
    const graphemes = getGraphemeClusters(word);
    const isFound = foundWords.includes(word);
    const isFlipping = flippingWords.has(word);
    
    return (
      <div key={word} className="flex gap-1 mb-2">
        {graphemes.map((grapheme, index) => (
          <div
            key={`${word}-${index}`}
            className={`
              ${isSmall ? 'w-8 h-8 text-sm' : 'w-9 h-9 md:w-10 md:h-10 text-base md:text-lg'}
              flex items-center justify-center rounded-lg font-bold shadow-md border-2 transition-all duration-300
              ${isFound 
                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-300 shadow-lg' 
                : 'bg-gray-200 text-gray-500 border-gray-300'
              }
              ${isFlipping ? 'animate-flip-in' : ''}
              relative overflow-hidden
            `}
            style={{ 
              fontFamily: 'Noto Sans Tamil, sans-serif',
              textShadow: isFound ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
              lineHeight: '1',
              minWidth: isSmall ? '2rem' : '2.25rem',
              minHeight: isSmall ? '2rem' : '2.25rem',
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Display the letter directly - simplified approach */}
            <span className="flex items-center justify-center w-full h-full">
              {isFound ? grapheme : ''}
            </span>
            
            {/* Sparkle effect for newly found words */}
            {isFlipping && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
                <div className="absolute bottom-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
                <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* Attempt Count - Show only on desktop and when not small */}
      {!isSmall && (
        <div className="hidden md:block mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <span className="text-sm font-medium text-gray-600">Attempts: </span>
            <span className="text-lg font-bold text-blue-600">{attemptCount}</span>
          </div>
        </div>
      )}
      {sortedWords.map(word => renderWordBlocks(word))}
    </div>
  );
};

export default WordBlocksList;