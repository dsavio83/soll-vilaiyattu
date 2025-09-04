
import React, { useState, useEffect } from 'react';
import { getGraphemeClusters } from '@/utils/tamilUtils';

interface WordInputProps {
  currentInput: string;
  disabled?: boolean;
  showNotification?: {
    type: 'correct' | 'wrong' | 'duplicate';
    word: string;
  } | null;
  centerLetter: string;
}

const WordInput = ({
  currentInput,
  disabled = false,
  showNotification = null,
  centerLetter
}: WordInputProps) => {
  const [notification, setNotification] = useState<{type: 'correct' | 'wrong' | 'duplicate'; word: string} | null>(null);
  
  useEffect(() => {
    if (showNotification) {
      setNotification(showNotification);
      
      // Clear notification after 2 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const letters = getGraphemeClusters(currentInput);

  return (
    <div className="mx-4 mb-0 relative">
      <div
        className="w-full text-center outline-none bg-transparent border-none focus:outline-none flex justify-center items-center"
        style={{
          fontFamily: 'Noto Sans Tamil, sans-serif',
          fontSize: '20px',
          lineHeight: '1.1',
          height: '32px',
          fontWeight: '900'
        }}
      >
        {letters.map((letter, index) => (
          <span key={index} style={{ color: letter === centerLetter ? '#ec4899' : 'black' }}>
            {letter}
          </span>
        ))}
        {!disabled && <span className="animate-blink w-1 h-6 bg-black ml-1"></span>}
      </div>
      
      {/* Notification Popup Overlay - positioned to the right side */}
      {notification && (
        <div 
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 py-2 px-4 rounded-full text-center text-sm font-medium transition-all duration-300 animate-bounce z-50 shadow-lg ${
            notification.type === 'correct'
              ? 'bg-green-500 text-white border-2 border-green-400' 
              : notification.type === 'duplicate'
              ? 'bg-yellow-500 text-white border-2 border-yellow-400'
              : 'bg-red-500 text-white border-2 border-red-400'
          }`}
          style={{ 
            fontFamily: 'Noto Sans Tamil, sans-serif',
            fontSize: '14px',
            whiteSpace: 'nowrap'
          }}
        >
          {notification.type === 'correct' 
            ? 'சரியான வார்த்தை!' 
            : notification.type === 'duplicate'
            ? 'போட்டாச்சு போட்டாச்சு'
            : 'இல்ல இல்ல வேற!'}
        </div>
      )}
    </div>
  );
};

export default WordInput;
