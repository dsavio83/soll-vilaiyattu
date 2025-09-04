
import React, { useState } from 'react';
import { Play, Trophy, Users, Star, Settings, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentLogin from './StudentLogin';
import AdminLoginModal from './AdminLoginModal';
import GoogleAds from './GoogleAds';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onLogin: (student: any) => void;
}

const LandingPage = ({ onLogin }: LandingPageProps) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGuestPlay = () => {
    // Create a guest user object
    const guestUser = {
      id: 'guest-' + Date.now(),
      name: 'Guest Player',
      admission_number: 'GUEST',
      class: 'Guest',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onLogin(guestUser);
  };

  if (showLogin) {
    return <StudentLogin onLogin={onLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 relative overflow-hidden">
      {/* Header Bar - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center py-4">
            {/* Left side - App Name */}
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                சொல்விளையாட்டு
              </h1>
            </div>

            {/* Right side - Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30 text-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span>Admin Login</span>
              </button>
              
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all duration-200 shadow-lg text-sm"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                <span>Play Game</span>
              </button>
              
              {/* <button
                onClick={handleGuestPlay}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg transition-all duration-200 shadow-lg text-sm"
              >
                <Play className="w-4 h-4 mr-2" />
                <span>Guest Play</span>
              </button> */}
            </div>
          </div>

          {/* Mobile Layout - Two Rows */}
          <div className="md:hidden py-3">
            {/* First Row - App Name */}
            <div className="flex justify-center mb-3">
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                சொல்விளையாட்டு
              </h1>
            </div>

            {/* Second Row - All Buttons */}
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30 text-xs"
              >
                <Settings className="w-4 h-4 mr-1" />
                <span>Admin</span>
              </button>
              
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all duration-200 shadow-lg text-xs"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                <span>Play Game</span>
              </button>
              
              {/* <button
                onClick={handleGuestPlay}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg transition-all duration-200 shadow-lg text-xs"
              >
                <Play className="w-4 h-4 mr-1" />
                <span>Guest Play</span>
              </button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-400 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-8 w-12 h-12 bg-orange-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main Content - with top padding for fixed header */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-white pt-24 md:pt-20">
        {/* Logo/Title */}
        <div className="text-center mt-8 mb-12 animate-fade-in">
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
              <div className="text-6xl font-bold text-yellow-300" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                அ
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Tamil Word Quest
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-2" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
            தமிழ் வார்த்தை வேட்டை
          </p>
          <p className="text-lg text-blue-200">
            Discover words in the hexagon puzzle
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 border border-white border-opacity-20">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-semibold mb-2">Challenge Yourself</h3>
            <p className="text-blue-100">Find hidden Tamil words in the hexagon</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 border border-white border-opacity-20">
            <Users className="w-12 h-12 mx-auto mb-4 text-green-300" />
            <h3 className="text-xl font-semibold mb-2">Compete</h3>
            <p className="text-blue-100">Compete with your classmates</p>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 border border-white border-opacity-20">
            <Star className="w-12 h-12 mx-auto mb-4 text-purple-300" />
            <h3 className="text-xl font-semibold mb-2">Learn</h3>
            <p className="text-blue-100">Improve your Tamil vocabulary</p>
          </div>
        </div>

        {/* Leaderboard Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/leaderboard')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-purple-500/25"
          >
            <Trophy className="w-6 h-6 mr-3 group-hover:bounce transition-transform" />
            View Leaderboard
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
        </div>

        {/* Landing Page Banner Ad */}
        <div className="mt-12 w-full max-w-2xl">
          <GoogleAds 
            adSlot="6833809490"
            adFormat="fluid"
            adLayoutKey="-fd+b+v-54+5s"
            style={{ minHeight: '120px' }}
            className="rounded-lg overflow-hidden"
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-blue-200">
          <p className="text-sm">
            Built with ❤️ for SFXHS, Parisakkal
          </p>
        </div>
      </div>

      {/* Floating Hexagons */}
      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 bg-yellow-400 opacity-10 transform rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>
      <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
        <div className="w-20 h-20 bg-pink-400 opacity-15 transform rotate-45 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
      </div>
      
      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onAdminLogin={async (credentials) => {

          const success = await login(credentials.username, credentials.password);
          if (success) {
            navigate('/admin');
          }
        }}
      />
    </div>
  );
};

export default LandingPage;
