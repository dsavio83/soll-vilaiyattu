
import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Award, User } from 'lucide-react';
import { mongodb } from '@/integrations/mongodb/client';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const LeaderboardModal = ({ isOpen, onClose, currentUserId }: LeaderboardModalProps) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboardByDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  const loadLeaderboardByDate = async (date: string) => {
    setLoading(true);
    try {
      const { data, error } = await mongodb
        .from('leaderboard_score')
        .select('*')
        .eq('game_date', date)
        .eq('complete_game', true)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true });

      if (error) {
        console.error('Error loading leaderboard:', error);
      } else {
        setLeaderboard(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    const rankNumber = index + 1;
    
    if (index === 0) return (
      <div className="flex flex-col items-center">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <span className="text-xs font-bold text-yellow-600 mt-1">#{rankNumber}</span>
      </div>
    );
    if (index === 1) return (
      <div className="flex flex-col items-center">
        <Award className="w-6 h-6 text-gray-400" />
        <span className="text-xs font-bold text-gray-500 mt-1">#{rankNumber}</span>
      </div>
    );
    if (index === 2) return (
      <div className="flex flex-col items-center">
        <Medal className="w-6 h-6 text-orange-500" />
        <span className="text-xs font-bold text-orange-600 mt-1">#{rankNumber}</span>
      </div>
    );
    return (
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <span className="text-sm font-bold text-blue-700">{rankNumber}</span>
        </div>
        <span className="text-xs font-bold text-blue-600 mt-1">#{rankNumber}</span>
      </div>
    );
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-2xl font-bold">
              {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Leaderboard" : "Leaderboard"}
            </h2>
            <p className="text-purple-100 mt-1 text-sm md:text-base">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div className="mt-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <p className="text-purple-200 mt-1 text-xs md:text-sm">
              {leaderboard.length} {leaderboard.length === 1 ? 'user has' : 'users have'} completed today's game
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedDate === new Date().toISOString().split('T')[0] ? 
                "No one has played today yet" : 
                "No games were played on this date"
              }
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top 3 Users - Special Layout */}
              {leaderboard.length > 0 && (
                <div className="flex items-end justify-center gap-4 mb-8">
                  {/* 2nd Place - Left */}
                  {leaderboard[1] && (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-gray-300">
                          <User className="w-8 h-8 text-gray-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-gray-800 text-sm" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                          {leaderboard[1].name}
                        </h3>
                        <p className="text-xs text-gray-600">Class {leaderboard[1].class}</p>
                        <p className="text-xs text-gray-500">{formatTime(leaderboard[1].time_taken)}</p>
                      </div>
                    </div>
                  )}

                  {/* 1st Place - Center */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center border-4 border-yellow-400">
                        <User className="w-10 h-10 text-yellow-700" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-yellow-800 text-base" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                        {leaderboard[0].name}
                      </h3>
                      <p className="text-sm text-yellow-700">Class {leaderboard[0].class}</p>
                      <p className="text-sm text-yellow-600">{formatTime(leaderboard[0].time_taken)}</p>
                    </div>
                  </div>

                  {/* 3rd Place - Right */}
                  {leaderboard[2] && (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center border-4 border-orange-300">
                          <User className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                          <Medal className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-orange-800 text-sm" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                          {leaderboard[2].name}
                        </h3>
                        <p className="text-xs text-orange-600">Class {leaderboard[2].class}</p>
                        <p className="text-xs text-orange-500">{formatTime(leaderboard[2].time_taken)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4th+ Users - List Format */}
              {leaderboard.length > 3 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Other Players</h4>
                  {leaderboard.slice(3).map((entry, index) => {
                    const actualIndex = index + 3;
                    const isCurrentUser = currentUserId && entry.student_id === currentUserId;
                    
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center p-4 rounded-lg border-2 transition-all relative ${
                          isCurrentUser
                            ? 'bg-green-50 border-green-300 shadow-md'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {/* Green dot for current user */}
                        {isCurrentUser && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                        
                        <div className="flex items-center justify-center w-16">
                          {getRankIcon(actualIndex)}
                        </div>
                        
                        <div className="flex-1 ml-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className={`font-semibold ${isCurrentUser ? 'text-green-800' : 'text-gray-900'}`} style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                                {entry.name}
                              </h3>
                              <p className={`text-sm ${isCurrentUser ? 'text-green-600' : 'text-gray-600'}`}>
                                {entry.admission_number} • Class {entry.class}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-lg font-bold ${isCurrentUser ? 'text-green-700' : 'text-green-600'}`}>
                                {entry.score} points
                              </div>
                              <div className={`text-sm ${isCurrentUser ? 'text-green-600' : 'text-gray-500'}`}>
                                {formatTime(entry.time_taken)} • {entry.words_found} words
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show top 3 in list format if less than 4 users */}
              {leaderboard.length <= 3 && leaderboard.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">All Players</h4>
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = currentUserId && entry.student_id === currentUserId;
                    
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center p-4 rounded-lg border-2 transition-all relative ${
                          isCurrentUser
                            ? 'bg-green-50 border-green-300 shadow-md'
                            : index === 0
                            ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg'
                            : index === 1
                            ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 shadow-md'
                            : index === 2
                            ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 shadow-md'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {/* Green dot for current user */}
                        {isCurrentUser && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                        
                        <div className="flex items-center justify-center w-16">
                          {getRankIcon(index)}
                        </div>
                        
                        <div className="flex-1 ml-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className={`font-semibold ${isCurrentUser ? 'text-green-800' : 'text-gray-900'}`} style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                                {entry.name}
                              </h3>
                              <p className={`text-sm ${isCurrentUser ? 'text-green-600' : 'text-gray-600'}`}>
                                {entry.admission_number} • Class {entry.class}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-lg font-bold ${isCurrentUser ? 'text-green-700' : 'text-green-600'}`}>
                                {entry.score} points
                              </div>
                              <div className={`text-sm ${isCurrentUser ? 'text-green-600' : 'text-gray-500'}`}>
                                {formatTime(entry.time_taken)} • {entry.words_found} words
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
