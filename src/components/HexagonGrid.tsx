
import React from 'react';

interface HexagonGridProps {
  letters: string[];
  centerLetter: string;
  onLetterClick: (letter: string) => void;
  disabled?: boolean;
}

const HexagonGrid = ({ letters, centerLetter, onLetterClick, disabled = false }: HexagonGridProps) => {
  // Always use exactly the letters provided, ensure 6 letters
  const surroundingLetters = letters.length === 6 ? letters : [...letters, ...Array(6 - letters.length).fill(centerLetter)].slice(0, 6);

  return (
    <div className="flex justify-center px-4">
      <div className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
        {/* Center hexagon - main letter */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!disabled) {
                onLetterClick(centerLetter);
              }
            }}
            onMouseDown={(e) => e.preventDefault()}
            disabled={disabled}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-2xl transition-all duration-200 border-4 ${
              disabled 
                ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white border-yellow-300 hover:border-yellow-400 active:scale-95 transform hover:scale-105'
            }`}
            style={{ 
              fontFamily: 'Noto Sans Tamil, sans-serif',
              fontWeight: '900',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              textAlign: 'center'
            }}>
              {centerLetter}
            </span>
          </button>
        </div>

        {/* Surrounding letters positioned in a perfect hexagon */}
        {surroundingLetters.map((letter, index) => {
          // Calculate position for each letter in a hexagon formation
          const angle = (index * 60) - 90; // Start from top, going clockwise
          const radian = (angle * Math.PI) / 180;
          const radius = 40; // Percentage of container size
          
          // Calculate x, y coordinates as percentages
          const x = 50 + Math.cos(radian) * radius;
          const y = 50 + Math.sin(radian) * radius;
          
          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!disabled) {
                    onLetterClick(letter);
                  }
                }}
                onMouseDown={(e) => e.preventDefault()}
                disabled={disabled}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-xl transition-all duration-200 border-3 ${
                  disabled
                    ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-br from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 text-gray-800 border-blue-400 hover:border-blue-500 active:scale-95 transform hover:scale-110'
                }`}
                style={{ 
                  fontFamily: 'Noto Sans Tamil, sans-serif',
                  fontWeight: '900',
                  lineHeight: '1'
                }}
              >
                <span className="flex items-center justify-center w-full h-full">
                  {letter}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HexagonGrid;
