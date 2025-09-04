
import React, { useState, useEffect } from 'react';
import { Trophy, LogOut, Award, Menu } from 'lucide-react';
import LeaderboardModal from './LeaderboardModal';
import LoginModal from './LoginModal';

import Sidebar from './Sidebar';

interface GameHeaderProps {
  isGameComplete: boolean;
  onGameComplete: (time: number) => void;
  finalTime?: number;
  time?: number;
  score?: number;
  totalScore?: number;
  socialScore?: number;
  onLogout?: () => void;
  username?: string;
  foundWordsCount?: number;
  totalWords?: number;
  headerVisible: boolean;
  controlHeader: () => void;
  level: number;
  className?: string;
  showYesterdayMode?: boolean;
  onStartTodayGame?: () => void;
  completionCount?: number;
}

const GameHeader = ({
  isGameComplete,
  onGameComplete,
  finalTime,
  time,
  score,
  totalScore,
  socialScore,
  onLogout,
  username,
  foundWordsCount,
  totalWords,
  headerVisible,
  controlHeader,
  level,
  className,
  showYesterdayMode,
  onStartTodayGame,
  completionCount = 0
}: GameHeaderProps) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);
      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [controlHeader]);



  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    
    if (clickCount === 2) {
      setShowLogin(true);
      setClickCount(0);
    } else {
      setClickTimer(setTimeout(() => {
        setClickCount(0);
      }, 1000));
    }
  };

  return (
    <>
      <div className={`bg-white shadow-sm border-b border-gray-200 px-4 py-3 fixed top-0 w-full z-10 transition-transform duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center justify-between">
          {/* Left Side - Menu and Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1
                className="text-lg font-semibold text-gray-800 cursor-pointer"
                onClick={handleTitleClick}
                style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
              >
                சொல் விளையாட்டு
              </h1>
              {showYesterdayMode && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-orange-600 font-medium" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    நேற்றைய விளையாட்டு
                  </span>
                  {onStartTodayGame && (
                    <button
                      onClick={onStartTodayGame}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                      style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                    >
                      இன்றைய விளையாட்டு
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Side - Stats */}
          <div className="flex items-center gap-3">
                        
            {/* Timer */}
            <span className="text-sm text-gray-600 font-mono">
              {formatTime(finalTime !== undefined ? finalTime : (time || 0))}
            </span>
          </div>
        </div>
      </div>

      <Sidebar 
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        username={username}
        className={className}
        socialScore={socialScore}
        onLogout={onLogout}
      />

      <LeaderboardModal 
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <LoginModal 
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  );
};

export default GameHeader;
