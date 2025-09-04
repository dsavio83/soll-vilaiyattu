import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Zap, Star, Award, TrendingUp, Calendar, Users, Brain, Sparkles, Timer } from 'lucide-react';
import { mongodb } from '@/integrations/mongodb/client';
import { Tables } from '@/integrations/mongodb/types';

type Student = Tables<'students'>;
type TodayScore = {
  score: number;
  words_found: number;
  time_taken: number;
  attempt_count: number;
};

interface GameCompletionAnalyticsProps {
  studentData: Student;
  todayScore: TodayScore;
  onLogout: () => void;
  onViewLeaderboard: () => void;
}

interface LeaderboardData {
  found_words: string;
  found_words_time: string;
  rank?: number;
  total_players?: number;
}

const GameCompletionAnalytics = ({ studentData, todayScore, onLogout, onViewLeaderboard }: GameCompletionAnalyticsProps) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [wordTimings, setWordTimings] = useState<any[]>([]);
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState<string>('');
  const [accuracy, setAccuracy] = useState<number>(0);

  useEffect(() => {
    loadLeaderboardData();
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get user's leaderboard entry
      const { data: userEntry } = await mongodb
        .from('leaderboard_score')
        .select('*')
        .eq('student_id', studentData.id)
        .eq('game_date', today)
        .single();

      if (userEntry) {
        // Get total players and user rank
        const { data: allEntries } = await mongodb
          .from('leaderboard_score')
          .select('student_id, score, time_taken, attempt_count')
          .eq('game_date', today)
          .order('score', { ascending: false })
          .order('time_taken', { ascending: true });

        const rank = allEntries?.findIndex(entry => entry.student_id === studentData.id) + 1 || 0;
        
        setLeaderboardData({
          ...userEntry,
          rank,
          total_players: allEntries?.length || 0
        });

        // Parse word timings
        if (userEntry.found_words_time) {
          try {
            const timings = JSON.parse(userEntry.found_words_time);
            setWordTimings(timings);
          } catch (e) {
            console.error('Error parsing word timings:', e);
          }
        }

        // Calculate accuracy
        const totalAttempts = todayScore.attempt_count || 1;
        const correctWords = todayScore.words_found || 0;
        setAccuracy(Math.round((correctWords / totalAttempts) * 100));
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    }
  };

  const updateCountdown = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeUntilTomorrow(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRankBadge = () => {
    if (!leaderboardData?.rank) return '🎯';
    if (leaderboardData.rank === 1) return '🥇';
    if (leaderboardData.rank === 2) return '🥈';
    if (leaderboardData.rank === 3) return '🥉';
    if (leaderboardData.rank <= 10) return '⭐';
    return '🎯';
  };

  const getPerformanceMessage = () => {
    if (!leaderboardData?.rank || !leaderboardData?.total_players) return 'சிறப்பான செயல்பாடு!';
    
    const percentage = (leaderboardData.rank / leaderboardData.total_players) * 100;
    
    if (percentage <= 10) return 'அற்புதமான செயல்பாடு! 🌟';
    if (percentage <= 25) return 'மிகச்சிறந்த செயல்பாடு! 🎉';
    if (percentage <= 50) return 'நல்ல செயல்பாடு! 👏';
    if (percentage <= 75) return 'சிறப்பான முயற்சி! 💪';
    return 'தொடர்ந்து முயற்சி செய்யுங்கள்! 🚀';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800/95 via-purple-800/95 to-pink-800/95 backdrop-blur-xl border-b border-white/20 shadow-2xl">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
                  <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-spin" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  விளையாட்டு முடிந்தது!
                </h1>
                <div className="relative">
                  <Award className="w-12 h-12 text-yellow-400 animate-bounce delay-300" />
                  <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -left-2 animate-spin delay-500" />
                </div>
              </div>
              
              <p className="text-xl text-white/90 font-semibold mb-2" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {getPerformanceMessage()}
              </p>
              
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Calendar className="w-5 h-5" />
                <span>{new Date().toLocaleDateString('ta-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
          {/* Performance Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-4 border border-blue-300/30">
              <div className="text-center">
                <Star className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-pulse" />
                <div className="text-2xl font-bold text-white">{todayScore.score}</div>
                <div className="text-blue-300 text-sm font-medium">மொத்த மதிப்பெண்</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-4 border border-green-300/30">
              <div className="text-center">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2 animate-bounce" />
                <div className="text-2xl font-bold text-white">{todayScore.words_found}</div>
                <div className="text-green-300 text-sm font-medium">கண்டுபிடித்த வார்த்தைகள்</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-4 border border-purple-300/30">
              <div className="text-center">
                <Timer className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="text-2xl font-bold text-white">{formatTime(todayScore.time_taken)}</div>
                <div className="text-purple-300 text-sm font-medium">எடுத்த நேரம்</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-4 border border-orange-300/30">
              <div className="text-center">
                <Brain className="w-8 h-8 text-orange-400 mx-auto mb-2 animate-pulse" />
                <div className="text-2xl font-bold text-white">{accuracy}%</div>
                <div className="text-orange-300 text-sm font-medium">துல்லியம்</div>
              </div>
            </div>
          </div>

          {/* Rank & Position */}
          {leaderboardData && (
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-6 border border-yellow-300/30 mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">{getRankBadge()}</div>
                <h3 className="text-2xl font-bold text-white mb-2">உங்கள் தரவரிசை</h3>
                <div className="text-4xl font-bold text-yellow-300 mb-2">#{leaderboardData.rank}</div>
                <p className="text-yellow-200">மொத்தம் {leaderboardData.total_players} வீரர்களில்</p>
              </div>
            </div>
          )}

          {/* Word Timeline */}
          {wordTimings.length > 0 && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                வார்த்தைகளின் காலவரிசை
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {wordTimings.map((timing, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-white font-semibold" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                        {timing.word}
                      </span>
                    </div>
                    <div className="text-blue-300 text-sm font-mono">
                      {formatTime(timing.time)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Countdown to Tomorrow */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-6 border border-indigo-300/30 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">அடுத்த விளையாட்டு</h3>
              <div className="text-4xl font-mono font-bold text-indigo-300 mb-2">{timeUntilTomorrow}</div>
              <p className="text-indigo-200">நாளை புதிய புதிர்!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onViewLeaderboard}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-6 h-6" />
                தரவரிசை பார்க்க
              </div>
            </button>
            
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-6 h-6" />
                வெளியேறு
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCompletionAnalytics;