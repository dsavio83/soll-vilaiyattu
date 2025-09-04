
import React from 'react';
import { X } from 'lucide-react';

interface CongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
  foundWords: string[];
  score: number;
  attemptCount?: number;
  timeTaken?: number;
  onPlayAgain: () => void;
}

const CongratsModal = ({ isOpen, onClose, foundWords, score, attemptCount = 0, timeTaken = 0, onPlayAgain }: CongratsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md">
        {/* Header */}
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          {/* Celebration Icon */}
          <div className="text-6xl mb-4">🎉</div>
          
          <h2 className="text-xl font-bold text-green-600 mb-2">
            வாழ்த்துகள்
          </h2>
          
          <p className="text-gray-600 mb-4">
            எடுத்துக்கொண்ட நேரம்: {Math.floor(timeTaken / 60).toString().padStart(2, '0')}:{(timeTaken % 60).toString().padStart(2, '0')} Mins<br />
            முயற்சிகள்: {attemptCount}<br />
            கண்டுபிடித்த சரியான சொற்கள்:
          </p>

          {/* Found Words Grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {foundWords.slice(0, 12).map((word, index) => (
              <div
                key={index}
                className="bg-green-500 text-white text-center py-2 rounded text-sm font-medium"
              >
                {word}
              </div>
            ))}
          </div>

          {/* Score */}
          <div className="text-lg font-bold text-gray-800 mb-6">
            அடுத்த கேம்: 14:42:29
          </div>

          {/* Game completed message */}
          <p className="text-gray-600 text-sm">
            Come back tomorrow for a new puzzle!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CongratsModal;
