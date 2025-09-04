import React from 'react';
import { X, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface WordTiming {
  word: string;
  time: number;
  timestamp: number;
}

interface DetailedLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordTimings: WordTiming[];
}

const DetailedLogModal = ({ isOpen, onClose, wordTimings }: DetailedLogModalProps) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const sortedByTime = [...wordTimings].sort((a, b) => a.time - b.time);
  const fastestWords = sortedByTime.slice(0, 3);
  const slowestWords = sortedByTime.slice(-3).reverse();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-2xl font-bold">Detailed Word Log</h2>
            <p className="text-blue-100 mt-1 text-sm md:text-base">
              Analysis of your word finding performance
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Total Words</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{wordTimings.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Fastest Word</h3>
              </div>
              <p className="text-lg font-bold text-green-600">
                {fastestWords[0] ? formatTime(fastestWords[0].time) : 'N/A'}
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingDown className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="font-semibold text-orange-800">Slowest Word</h3>
              </div>
              <p className="text-lg font-bold text-orange-600">
                {slowestWords[0] ? formatTime(slowestWords[0].time) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Fastest Words
              </h3>
              <div className="space-y-2">
                {fastestWords.map((timing, index) => (
                  <div key={timing.word} className="flex justify-between items-center bg-white p-2 rounded">
                    <span className="font-medium" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                      #{index + 1} {timing.word}
                    </span>
                    <span className="text-green-600 font-bold">{formatTime(timing.time)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-bold text-orange-800 mb-3 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                Slowest Words
              </h3>
              <div className="space-y-2">
                {slowestWords.map((timing, index) => (
                  <div key={timing.word} className="flex justify-between items-center bg-white p-2 rounded">
                    <span className="font-medium" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                      #{index + 1} {timing.word}
                    </span>
                    <span className="text-orange-600 font-bold">{formatTime(timing.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Words Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Complete Timeline
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wordTimings.map((timing, index) => (
                <div key={`${timing.word}-${index}`} className="flex justify-between items-center bg-white p-2 rounded border-l-4 border-blue-400">
                  <div>
                    <span className="font-medium text-gray-600 text-sm">#{index + 1}</span>
                    <span className="ml-2 font-medium" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                      {timing.word}
                    </span>
                  </div>
                  <span className="text-blue-600 font-bold">{formatTime(timing.time)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedLogModal;