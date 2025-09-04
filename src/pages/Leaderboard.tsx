import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Award, Crown, Star, Clock, Target, Zap, Users, Globe, Filter, Calendar, TrendingUp, Award as AwardIcon, Sparkles, Timer, Brain, GamepadIcon } from 'lucide-react';
import { mongodb } from '@/integrations/mongodb/client';
import { useNavigate } from 'react-router-dom';
import GoogleAds from '@/components/GoogleAds';

interface LeaderboardEntry {
  id: string;
  student_id: string;
  admission_number: string;
  name: string;
  class: string;
  score: number;
  time_taken: number;
  words_found: number;
  attempt_count: number;
  game_date: string;
  completed_at: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'global' | 'class'>('global');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Get current user from localStorage
  React.useEffect(() => {
    const studentData = localStorage.getItem('studentData');
    if (studentData) {
      const student = JSON.parse(studentData);
      setCurrentUserId(student.id);
    }
  }, []);

  useEffect(() => {
    loadLeaderboardByDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    filterLeaderboard();
  }, [leaderboard, activeFilter, selectedClass]);

  const loadLeaderboardByDate = async (date: string) => {
    setLoading(true);
    try {
      const { data, error } = await mongodb
        .from('leaderboard_score')
        .select('*')
        .eq('game_date', date)
        .eq('complete_game', true)
        .order('time_taken', { ascending: true })
        .order('attempt_count', { ascending: true })
        .order('score', { ascending: false });

      if (error) {
        setLeaderboard([]);
      } else {
        const entries = data || [];
        setLeaderboard(entries);
        
        // Calculate statistics
        setTotalPlayers(entries.length);
        if (entries.length > 0) {
          const avgTime = Math.round(entries.reduce((sum, entry) => sum + entry.time_taken, 0) / entries.length);
          const avgScore = Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length);
          setAverageTime(avgTime);
          setAverageScore(avgScore);
        }
        
        // Extract unique classes
        const classes = [...new Set(entries.map(entry => entry.class))].sort((a, b) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          return numA - numB;
        });
        setAvailableClasses(classes);
        
        if (classes.length > 0 && !selectedClass) {
          setSelectedClass(classes[0]);
        }
      }
    } catch (error) {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLeaderboard = () => {
    if (activeFilter === 'global') {
      setFilteredLeaderboard(leaderboard);
    } else if (activeFilter === 'class' && selectedClass) {
      const classFiltered = leaderboard.filter(entry => entry.class === selectedClass);
      setFilteredLeaderboard(classFiltered);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (index: number) => {
    const rankNumber = index + 1;
    
    if (index === 0) return (
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-2xl border-4 border-yellow-300">
          <Crown className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white">
          1
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-yellow-400 rounded-full blur-sm"></div>
      </div>
    );
    if (index === 1) return (
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-2xl border-4 border-gray-200">
          <Award className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white">
          2
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-gray-400 rounded-full blur-sm"></div>
      </div>
    );
    if (index === 2) return (
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-2xl border-4 border-orange-300">
          <Medal className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white">
          3
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-orange-400 rounded-full blur-sm"></div>
      </div>
    );
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-xl border-4 border-blue-300">
        <span className="text-xl font-bold text-white drop-shadow-lg">{rankNumber}</span>
      </div>
    );
  };

  const getClassDisplayName = (classNumber: string) => {
    return `Class ${classNumber}`;
  };

  const getRankBadge = (index: number) => {
    const rank = index + 1;
    if (rank === 1) return "🥇 Today's Champions";
    if (rank === 2) return "🥈 Second Place";
    if (rank === 3) return "🥉 Third Place";
    if (rank <= 5) return "⭐ Top 5";
    if (rank <= 10) return "🌟 Top 10";
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-yellow-300/40 rounded-full animate-bounce delay-1500"></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-pink-300/40 rounded-full animate-bounce delay-2500"></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 bg-gradient-to-r from-indigo-800/95 via-purple-800/95 to-pink-800/95 backdrop-blur-xl border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto py-6 px-4">
          {/* Header Top Row */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="group p-3 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl text-white hover:from-white/20 hover:to-white/10 transition-all duration-300 transform hover:scale-105 shadow-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" />
            </button>
            
            {/* Date Picker - Mobile Optimized */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-2 border border-white/20">
              <Calendar className="w-5 h-5 text-blue-300" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
          
          {/* Title Section */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="relative">
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 animate-pulse" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                Hall of Fame
              </h1>
              <div className="relative">
                <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-400 animate-pulse" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -left-1 animate-spin delay-500" />
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-white/90 font-semibold" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              {selectedDate === new Date().toISOString().split('T')[0] ? 'இன்றைய சாம்பியன்கள்' : 'அன்றைய சாம்பியன்கள்'}
            </p>
            
            <p className="text-sm md:text-base text-white/70 mt-1">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="mb-6">
            {/* Mobile: Animated Cards Grid */}
            <div className="grid grid-cols-3 md:hidden gap-2 mb-4">
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-lg rounded-2xl p-3 border border-emerald-300/30 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="relative mb-2">
                    <Users className="w-6 h-6 text-emerald-400 mx-auto animate-bounce" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="text-xl font-bold text-white">{totalPlayers}</div>
                  <div className="text-emerald-300 text-xs font-medium">Players</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-3 border border-blue-300/30 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="relative mb-2">
                    <Timer className="w-6 h-6 text-blue-400 mx-auto animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping delay-300"></div>
                  </div>
                  <div className="text-lg font-bold text-white">{formatTime(averageTime)}</div>
                  <div className="text-blue-300 text-xs font-medium">Avg Time</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-3 border border-purple-300/30 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="relative mb-2">
                    <Brain className="w-6 h-6 text-purple-400 mx-auto animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-500"></div>
                  </div>
                  <div className="text-xl font-bold text-white">{averageScore}</div>
                  <div className="text-purple-300 text-xs font-medium">Avg Score</div>
                </div>
              </div>
            </div>

            {/* Desktop: Enhanced Grid Layout */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              <div className="group bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-lg rounded-3xl p-6 border border-emerald-300/20 hover:border-emerald-300/40 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="relative p-4 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-emerald-400 group-hover:animate-bounce" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors">{totalPlayers}</div>
                    <div className="text-emerald-300 text-sm font-medium">Players Today</div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-3xl p-6 border border-blue-300/20 hover:border-blue-300/40 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="relative p-4 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Timer className="w-8 h-8 text-blue-400 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping delay-300"></div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">{formatTime(averageTime)}</div>
                    <div className="text-blue-300 text-sm font-medium">Average Time</div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-3xl p-6 border border-purple-300/20 hover:border-purple-300/40 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="relative p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-purple-400 group-hover:animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full animate-ping delay-500"></div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">{averageScore}</div>
                    <div className="text-purple-300 text-sm font-medium">Average Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filter Tabs */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('global')}
                className={`group flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 flex-1 md:flex-none ${
                  activeFilter === 'global'
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white shadow-xl border border-blue-300/50 backdrop-blur-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20 backdrop-blur-lg'
                }`}
              >
                <Globe className={`w-5 h-5 transition-transform duration-300 ${activeFilter === 'global' ? 'animate-spin' : 'group-hover:rotate-12'}`} style={{ animationDuration: '3s' }} />
                <span className="text-sm md:text-base">Global</span>
              </button>
              
              <button
                onClick={() => setActiveFilter('class')}
                className={`group flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 flex-1 md:flex-none ${
                  activeFilter === 'class'
                    ? 'bg-gradient-to-r from-green-500/30 to-teal-500/30 text-white shadow-xl border border-green-300/50 backdrop-blur-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20 backdrop-blur-lg'
                }`}
              >
                <GamepadIcon className={`w-5 h-5 transition-transform duration-300 ${activeFilter === 'class' ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                <span className="text-sm md:text-base">Class</span>
              </button>
            </div>
            
            {activeFilter === 'class' && availableClasses.length > 0 && (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-lg transition-all duration-300 hover:border-white/50"
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls} className="text-gray-800 bg-white">
                    {getClassDisplayName(cls)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              {/* Multi-layered loading animation */}
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-purple-400 to-pink-400 border-t-transparent"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-purple-400 opacity-20"></div>
              <div className="absolute inset-2 animate-pulse rounded-full h-16 w-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
              
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-300"></div>
              <div className="absolute top-1/2 -left-4 w-2 h-2 bg-green-400 rounded-full animate-bounce delay-500"></div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Loading Champions...</h3>
              <p className="text-white/60 text-sm">Fetching the best players</p>
            </div>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-8 relative">
              {/* Enhanced empty state */}
              <div className="relative inline-block">
                <Trophy className="w-32 h-32 text-white/20 mx-auto mb-6 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-dashed border-white/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                </div>
                
                {/* Floating question marks */}
                <div className="absolute -top-4 -right-4 text-2xl animate-bounce">❓</div>
                <div className="absolute -bottom-4 -left-4 text-xl animate-bounce delay-500">🤔</div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 animate-pulse" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {activeFilter === 'class' ? `${getClassDisplayName(selectedClass)} இல் யாரும் விளையாடவில்லை` : 
                 selectedDate === new Date().toISOString().split('T')[0] ? 'இன்று யாரும் விளையாடவில்லை' : 'இந்த தேதியில் யாரும் விளையாடவில்லை'}
              </h3>
              
              <div className="bg-gradient-to-r from-white/10 to-transparent backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
                <p className="text-white/80 text-lg mb-4">
                  {selectedDate === new Date().toISOString().split('T')[0] ? 
                    "Be the first to complete today's puzzle! 🎆" : 
                    "No games were played on this date. 📅"
                  }
                </p>
                
                {selectedDate === new Date().toISOString().split('T')[0] && (
                  <button
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Playing! 🎮
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Champions Section Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <Medal className="w-8 h-8 text-yellow-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                  {selectedDate === new Date().toISOString().split('T')[0] ? 'இன்றைய சாம்பியன்கள்' : 'அன்றைய சாம்பியன்கள்'}
                </h2>
                <div className="relative">
                  <Award className="w-8 h-8 text-yellow-400 animate-pulse" />
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping delay-300"></div>
                </div>
              </div>
              <p className="text-white/80 text-sm md:text-base font-medium">
                {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Champions" : "Champions of the Day"}
              </p>
            </div>
            
            {/* Top 3 Podium Section */}
            <div className="mb-8">
              {/* Desktop: Horizontal Scroll, Mobile: Centered Top 3 */}
              <div className="relative">
                {/* Mobile Top 3 Podium - Equal Spacing */}
                <div className="block md:hidden">
                  {filteredLeaderboard.length >= 3 && (
                    <div className="flex justify-between items-end mb-6 px-4">
                      {/* Second Place */}
                      <div className="text-center flex-1">
                        <div className="relative mb-3">
                          <div className="w-16 h-24 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-2xl flex items-end justify-center pb-2 shadow-xl border-2 border-gray-200 mx-auto">
                            <span className="text-2xl font-bold text-gray-800">2</span>
                          </div>
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <span className="text-lg">🥈</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20 shadow-lg mx-auto max-w-24">
                          <h3 className="font-bold text-white text-xs mb-1 leading-tight" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                            {filteredLeaderboard[1].name.length > 8 ? 
                              `${filteredLeaderboard[1].name.substring(0, 8)}...` : 
                              filteredLeaderboard[1].name
                            }
                          </h3>
                          <div className="text-lg font-bold text-gray-300 mb-1">{filteredLeaderboard[1].score}</div>
                          <div className="text-xs text-purple-200">{formatTime(filteredLeaderboard[1].time_taken)}</div>
                        </div>
                      </div>

                      {/* First Place - Enhanced */}
                      <div className="text-center flex-1">
                        <div className="relative mb-4">
                          <div className="w-20 h-32 bg-gradient-to-t from-yellow-500 via-yellow-400 to-yellow-300 rounded-t-3xl flex items-end justify-center pb-3 shadow-2xl border-4 border-yellow-200 mx-auto transform hover:scale-105 transition-all duration-300">
                            <span className="text-3xl font-bold text-yellow-900 animate-pulse">1</span>
                          </div>
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-bounce">
                              <Crown className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-ping opacity-30"></div>
                          </div>
                          {/* Sparkle effects */}
                          <Sparkles className="absolute top-2 left-2 w-4 h-4 text-yellow-300 animate-spin" />
                          <Sparkles className="absolute top-4 right-1 w-3 h-3 text-orange-300 animate-spin delay-500" />
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-lg rounded-2xl p-4 border-2 border-yellow-300/50 shadow-2xl mx-auto max-w-32 transform hover:scale-105 transition-all duration-300">
                          <h3 className="font-bold text-white text-sm mb-2 leading-tight" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                            {filteredLeaderboard[0].name.length > 10 ? 
                              `${filteredLeaderboard[0].name.substring(0, 10)}...` : 
                              filteredLeaderboard[0].name
                            }
                          </h3>
                          <div className="text-2xl font-bold text-yellow-200 mb-1 animate-pulse">{filteredLeaderboard[0].score}</div>
                          <div className="text-xs text-yellow-300 font-medium">{formatTime(filteredLeaderboard[0].time_taken)}</div>
                        </div>
                      </div>

                      {/* Third Place */}
                      <div className="text-center flex-1">
                        <div className="relative mb-3">
                          <div className="w-14 h-20 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-2xl flex items-end justify-center pb-2 shadow-xl border-2 border-orange-200 mx-auto">
                            <span className="text-xl font-bold text-orange-800">3</span>
                          </div>
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <span className="text-sm">🥉</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20 shadow-lg mx-auto max-w-20">
                          <h3 className="font-bold text-white text-xs mb-1 leading-tight" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                            {filteredLeaderboard[2].name.length > 7 ? 
                              `${filteredLeaderboard[2].name.substring(0, 7)}...` : 
                              filteredLeaderboard[2].name
                            }
                          </h3>
                          <div className="text-lg font-bold text-orange-300 mb-1">{filteredLeaderboard[2].score}</div>
                          <div className="text-xs text-purple-200">{formatTime(filteredLeaderboard[2].time_taken)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mobile: Show remaining top performers in compact cards */}
                  {filteredLeaderboard.length > 3 && (
                    <div className="grid grid-cols-2 gap-2 px-2 mb-4">
                      {filteredLeaderboard.slice(3, 7).map((entry, index) => {
                        const rank = index + 4;
                        return (
                          <div key={entry.id} className="bg-white/5 backdrop-blur-lg rounded-lg p-2 border border-white/10">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {rank}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold text-sm truncate" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                                  {entry.name}
                                </h4>
                                <div className="flex justify-between items-center">
                                  <span className="text-purple-300 font-bold text-sm">{entry.score}</span>
                                  <span className="text-purple-400 text-xs">{formatTime(entry.time_taken)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop: Compact Top 3 + Remaining */}
                <div className="hidden md:block">
                  {filteredLeaderboard.length >= 3 && (
                    <div className="flex justify-center items-end mb-8 px-4">
                      {/* Second Place */}
                      <div className="text-center flex-1 max-w-48">
                        <div className="relative mb-4">
                          <div className="w-20 h-28 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-2xl flex items-end justify-center pb-3 shadow-xl border-2 border-gray-200 mx-auto">
                            <span className="text-3xl font-bold text-gray-800">2</span>
                          </div>
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <span className="text-xl">🥈</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20 shadow-lg mx-auto">
                          <h3 className="font-bold text-white text-lg mb-2 leading-tight" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                            {filteredLeaderboard[1].name}
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">{getClassDisplayName(filteredLeaderboard[1].class)}</p>
                          <div className="text-2xl font-bold text-gray-300 mb-2">{filteredLeaderboard[1].score}</div>
                          <div className="text-sm text-purple-200">{formatTime(filteredLeaderboard[1].time_taken)}</div>
                          <div className="text-xs text-purple-300 mt-1">{filteredLeaderboard[1].words_found} words</div>
                        </div>
                      </div>

                      {/* First Place - Bigger */}
                      <div className="text-center flex-1 max-w-56">
                        <div className="relative mb-4">
                          <div className="w-24 h-36 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-3xl flex items-end justify-center pb-4 shadow-2xl border-3 border-yellow-200 mx-auto">
                            <span className="text-4xl font-bold text-yellow-800">1</span>
                          </div>
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl border-3 border-white animate-pulse">
                              <span className="text-3xl">👑</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-300/30 shadow-xl mx-auto">
                          <h3 className="font-bold text-white text-xl mb-2 leading-tight" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                            {filteredLeaderboard[0].name}
                          </h3>
                          <p className="text-yellow-200 text-sm mb-3">{getClassDisplayName(filteredLeaderboard[0].class)}</p>
                          <div className="text-3xl font-bold text-yellow-300 mb-2">{filteredLeaderboard[0].score}</div>
                          <div className="text-sm text-yellow-200">{formatTime(filteredLeaderboard[0].time_taken)}</div>
                          <div className="text-xs text-yellow-300 mt-1">{filteredLeaderboard[0].words_found} words</div>
                        </div>
                      </div>

                      {/* Third Place */}
                      <div className="text-center flex-1 max-w-44">
                        <div className="relative mb-4">
                          <div className="w-18 h-24 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-2xl flex items-end justify-center pb-2 shadow-xl border-2 border-orange-200 mx-auto">
                            <span className="text-2xl font-bold text-orange-800">3</span>
                          </div>
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <span className="text-lg">🥉</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20 shadow-lg mx-auto">
                          <h3 className="font-bold text-white text-base mb-2 leading-tight" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                            {filteredLeaderboard[2].name}
                          </h3>
                          <p className="text-orange-300 text-sm mb-2">{getClassDisplayName(filteredLeaderboard[2].class)}</p>
                          <div className="text-xl font-bold text-orange-300 mb-2">{filteredLeaderboard[2].score}</div>
                          <div className="text-sm text-purple-200">{formatTime(filteredLeaderboard[2].time_taken)}</div>
                          <div className="text-xs text-purple-300 mt-1">{filteredLeaderboard[2].words_found} words</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Desktop: Show remaining top performers in grid */}
                  {filteredLeaderboard.length > 3 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {filteredLeaderboard.slice(3, 11).map((entry, index) => {
                        const rank = index + 4;
                        return (
                          <div key={entry.id} className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {rank}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold text-sm truncate" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                                  {entry.name}
                                </h4>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-purple-300 font-bold">{entry.score}</span>
                                  <span className="text-purple-400 text-xs">{formatTime(entry.time_taken)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Full Leaderboard */}
            <div className="flex gap-6">
              {/* Main Leaderboard */}
              <div className="flex-1">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                  <div className="p-4 md:p-6 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <AwardIcon className="w-6 h-6 md:w-7 md:h-7 text-yellow-400 animate-pulse" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                        </div>
                        <div>
                          <h2 className="text-lg md:text-xl font-bold text-white">Complete Rankings</h2>
                          <p className="text-xs md:text-sm text-white/70">{filteredLeaderboard.length} players competing</p>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-lg rounded-full px-3 py-1 border border-white/20">
                        <span className="text-sm font-bold text-white">{filteredLeaderboard.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-white/10">
                    {filteredLeaderboard.map((entry, index) => {
                      const rankNumber = index + 1;
                      const isCurrentUser = currentUserId && entry.student_id === currentUserId;
                      
                      return (
                        <React.Fragment key={`${entry.id}-${index}`}>
                          <div
                            className={`group p-4 md:p-6 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent transition-all duration-500 transform hover:scale-[1.02] ${
                              index < 3 ? 'bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-transparent border-l-2 border-yellow-400/50' : ''
                            } ${
                              isCurrentUser ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-pink-500/5 border-l-4 border-blue-400 shadow-lg' : ''
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center gap-3 md:gap-6">
                              {/* Enhanced Rank */}
                              <div className="flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                {getRankIcon(index)}
                              </div>
                              
                              {/* Student Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1 md:mb-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h3 className={`text-sm md:text-xl font-bold leading-tight group-hover:scale-105 transition-transform duration-300 ${
                                            isCurrentUser ? 'text-blue-300' : 'text-white'
                                          }`} style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                                            {entry.name}
                                          </h3>
                                          {isCurrentUser && (
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                              <span className="text-blue-400 text-xs font-bold animate-pulse">(You)</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-2 ${
                                        index === 0 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                        index === 1 ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                        index === 2 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                        isCurrentUser ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      }`}>
                                        {getRankBadge(index)}
                                      </span>
                                    </div>
                                    <p className={`text-xs md:text-sm mb-2 md:mb-3 ${
                                      isCurrentUser ? 'text-blue-300' : 'text-purple-300'
                                    }`}>
                                      {entry.admission_number} • {getClassDisplayName(entry.class)}
                                    </p>
                                    
                                    {/* Enhanced Mobile Stats */}
                                    <div className="block md:hidden">
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-2">
                                            <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl px-3 py-2 border border-purple-300/30 transform hover:scale-105 transition-all duration-300">
                                              <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-purple-300" />
                                                <span className="text-white font-bold text-sm">{entry.score}</span>
                                              </div>
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl px-3 py-2 border border-blue-300/30 transform hover:scale-105 transition-all duration-300">
                                              <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-blue-300" />
                                                <span className="text-white font-mono text-xs">{formatTime(entry.time_taken)}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 bg-green-500/20 rounded-lg px-2 py-1">
                                              <Target className="w-3 h-3 text-green-400" />
                                              <span className="text-green-400 text-xs font-bold">{entry.words_found}</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-orange-500/20 rounded-lg px-2 py-1">
                                              <Zap className="w-3 h-3 text-orange-400" />
                                              <span className="text-orange-400 text-xs font-bold">{entry.attempt_count}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Enhanced Desktop Stats Grid */}
                                    <div className="hidden md:grid grid-cols-4 gap-4">
                                      <div className="group/stat bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-300/20 hover:border-purple-300/40 transition-all duration-300 transform hover:scale-105">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="p-1 bg-purple-500/20 rounded-lg">
                                            <Star className="w-4 h-4 text-purple-400 group-hover/stat:animate-spin" />
                                          </div>
                                          <span className="text-xs text-purple-300 font-medium">Score</span>
                                        </div>
                                        <div className="text-xl font-bold text-white group-hover/stat:text-purple-300 transition-colors">{entry.score}</div>
                                      </div>
                                      
                                      <div className="group/stat bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-300/20 hover:border-blue-300/40 transition-all duration-300 transform hover:scale-105">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="p-1 bg-blue-500/20 rounded-lg">
                                            <Clock className="w-4 h-4 text-blue-400 group-hover/stat:animate-pulse" />
                                          </div>
                                          <span className="text-xs text-blue-300 font-medium">Time</span>
                                        </div>
                                        <div className="text-xl font-bold text-white font-mono group-hover/stat:text-blue-300 transition-colors">{formatTime(entry.time_taken)}</div>
                                      </div>
                                      
                                      <div className="group/stat bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-300/20 hover:border-green-300/40 transition-all duration-300 transform hover:scale-105">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="p-1 bg-green-500/20 rounded-lg">
                                            <Target className="w-4 h-4 text-green-400 group-hover/stat:animate-bounce" />
                                          </div>
                                          <span className="text-xs text-green-300 font-medium">Words</span>
                                        </div>
                                        <div className="text-xl font-bold text-white group-hover/stat:text-green-300 transition-colors">{entry.words_found}</div>
                                      </div>
                                      
                                      <div className="group/stat bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-4 border border-orange-300/20 hover:border-orange-300/40 transition-all duration-300 transform hover:scale-105">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="p-1 bg-orange-500/20 rounded-lg">
                                            <Zap className="w-4 h-4 text-orange-400 group-hover/stat:animate-pulse" />
                                          </div>
                                          <span className="text-xs text-orange-300 font-medium">Attempts</span>
                                        </div>
                                        <div className="text-xl font-bold text-white group-hover/stat:text-orange-300 transition-colors">{entry.attempt_count}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Desktop: Insert Ad after every 8 entries */}
                          {(index + 1) % 8 === 0 && index < filteredLeaderboard.length - 1 && (
                            <div className="hidden md:block p-6 bg-white/5">
                              <GoogleAds 
                                adSlot="6833809490"
                                adFormat="fluid"
                                adLayoutKey="-fd+b+v-54+5s"
                                style={{ minHeight: '100px' }}
                                className="rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
                              />
                            </div>
                          )}

                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Enhanced Desktop Sidebar Ad */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-6 space-y-6">
                  <GoogleAds 
                    adSlot="8615177916"
                    adFormat="auto"
                    style={{ minHeight: '600px' }}
                    className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl"
                  />
                  
                  {/* Quick Stats Card */}
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Total Players</span>
                        <span className="text-white font-bold">{totalPlayers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Best Time</span>
                        <span className="text-green-400 font-bold">{filteredLeaderboard.length > 0 ? formatTime(filteredLeaderboard[0]?.time_taken || 0) : '--'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Top Score</span>
                        <span className="text-yellow-400 font-bold">{filteredLeaderboard.length > 0 ? filteredLeaderboard[0]?.score || 0 : '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;