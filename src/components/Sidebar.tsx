import React, { useState } from 'react';
import { X, User, Award, Calendar, Trophy, BookOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GameRulesModal from './GameRulesModal';
import YesterdayWordsModal from './YesterdayWordsModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  className?: string;
  socialScore?: number;
  onLogout?: () => void;
}

const Sidebar = ({ isOpen, onClose, username, className, socialScore, onLogout }: SidebarProps) => {
  const [showGameRules, setShowGameRules] = useState(false);
  const [showYesterdayWords, setShowYesterdayWords] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const menuItems = [
    {
      icon: <User className="w-5 h-5" />,
      label: '',
      value: username || 'User',
      subtext: className || '',
      color: 'text-blue-600'
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: 'Social Score',
      value: socialScore?.toString() || '0',
      color: 'text-yellow-600'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Yesterday Answer',
      action: () => setShowYesterdayWords(true),
      color: 'text-green-600'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Leaderboard',
      action: () => {
        onClose();
        navigate('/leaderboard');
      },
      color: 'text-purple-600'
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'விளையாட்டு விதி',
      action: () => setShowGameRules(true),
      color: 'text-indigo-600'
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 transform transition-transform duration-300 border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <img 
              src="/sidebar.png" 
              alt="Menu" 
              className="w-8 h-8 filter brightness-0 invert"
            />
            <h2 className="text-xl font-bold text-white">Menu</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-3">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 ${
                item.action 
                  ? 'cursor-pointer hover:bg-white hover:scale-105 bg-gradient-to-r from-gray-50 to-white' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}
              onClick={item.action}
            >
              <div className="flex items-center gap-3">
                <div className={`${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  {item.label === 'Social Score' ? (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 text-sm">{item.label}</span>
                      <span className="text-lg font-bold text-gray-900">{item.value}</span>
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                      {item.value && (
                        <div
                          className="text-lg font-bold text-gray-900 mt-1"
                          style={{
                            fontFamily:
                              item.label === 'Profile'
                                ? 'Noto Sans Tamil, sans-serif'
                                : 'inherit',
                          }}
                        >
                          {item.value}
                        </div>
                      )}
                      {item.subtext && (
                        <div
                          className="text-sm text-gray-600 mt-1"
                          style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                        >
                          Class {item.subtext}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        {onLogout && (
          <div className="absolute bottom-6 left-4 right-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <GameRulesModal 
        isOpen={showGameRules}
        onClose={() => setShowGameRules(false)}
      />
      
      <YesterdayWordsModal 
        isOpen={showYesterdayWords}
        onClose={() => setShowYesterdayWords(false)}
      />
    </>
  );
};

export default Sidebar;
