import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WordInput from '../components/WordInput';
import HexagonGrid from '../components/HexagonGrid';
import GameControls from '../components/GameControls';
import WordsModal from '../components/WordsModal';
import CongratsModal from '../components/CongratsModal';
import LandingPage from '../components/LandingPage';
import CompletionEffect from '../components/CompletionEffect';

import DesktopWordsList from '../components/DesktopWordsList';
import DetailedLogModal from '../components/DetailedLogModal';

import GameHeader from '../components/GameHeader';
import MotivationProgress from '../components/MotivationProgress';
import NextGameCountdown from '../components/NextGameCountdown';
import PWAInstallBanner from '../components/PWAInstallBanner';
import GameCompletionMessage from '../components/GameCompletionMessage';
import GameCompletionScreen from '../components/GameCompletionScreen';
import UserHeader from '../components/UserHeader';
import GoogleAds from '../components/GoogleAds';
import InterstitialAd from '../components/InterstitialAd';
import { useGameState } from '../hooks/useGameState';
import { mongodb } from '@/integrations/mongodb/client';
import { getGraphemeClusters } from '@/utils/tamilUtils';
import { Tables } from '@/integrations/mongodb/types';

type Student = Tables<'students'>;
type TodayScore = {
  score: number;
  words_found: number;
  time_taken: number;
  attempt_count: number;
};

const Index = () => {
  const navigate = useNavigate();
  const {
    currentInput,
    setCurrentInput,
    foundWords,
    score,
    surroundingLetters,
    centerLetter,
    isGameComplete,
    setIsGameComplete,
    totalWords,
    addWord,
    resetGame,
    shuffleLetters,
    getProgressMessage,
    getProgressLevel,
    allValidWords,
    hasPlayedToday,
    setHasPlayedToday,
    setFoundWords,
    wordTimings,
    setWordTimings,
    todayTime,
    gameStartTime,
    setGameStartTime,
    showYesterdayMode,
    yesterdayWords,
    canPlayToday,
    startTodayGame,
    checkTodayProgress,
    moveToLeaderboard,
    initializeUserProgress,
    attemptCount,
    setAttemptCount
  } = useGameState();

  const [showWordsModal, setShowWordsModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [showCompletionEffect, setShowCompletionEffect] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [todayScore, setTodayScore] = useState<TodayScore | null>(null);
  const [socialScore, setSocialScore] = useState<number>(0);
  const [finalTime, setFinalTime] = useState<number | undefined>(undefined);
  const [gameAvailable, setGameAvailable] = useState<boolean>(true);
  const [gamesPlayedCount, setGamesPlayedCount] = useState(0);
  const [isGameInputDisabled, setIsGameInputDisabled] = useState(false);

  const [showDetailedLogModal, setShowDetailedLogModal] = useState(false);
  const [sessionPersisted, setSessionPersisted] = useState(false);
  const [wordNotification, setWordNotification] = useState<{type: 'correct' | 'wrong' | 'duplicate'; word: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday'>('today');
  const [desktopYesterdayMode, setDesktopYesterdayMode] = useState(false);
  const [showYesterdayOnlyModal, setShowYesterdayOnlyModal] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [completionCount, setCompletionCount] = useState(0);
  const [time, setTime] = useState(0);

  const controlHeader = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY) { // if scroll down hide the header
        setHeaderVisible(false);
      } else { // if scroll up show the header
        setHeaderVisible(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!hasPlayedToday && !isGameComplete && gameStartTime && studentData) {
      interval = setInterval(() => {
        setTime(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
    } else {
      // Stop timer if game is complete or user has played today
      setTime(0);
    }

    return () => clearInterval(interval);
  }, [hasPlayedToday, isGameComplete, gameStartTime, studentData]);

  useEffect(() => {
    if (studentData && !gameStartTime && !hasPlayedToday) {
      setGameStartTime(Date.now());
    }
  }, [studentData, gameStartTime, hasPlayedToday]);

  // Check for persisted session on load
  useEffect(() => {
    const persistedSession = localStorage.getItem('student_session');
    if (persistedSession && !studentData) {
      try {
        const session = JSON.parse(persistedSession);
        setStudentData(session);
        setSessionPersisted(true);
      } catch (error) {
        console.error('Error loading persisted session:', error);
        localStorage.removeItem('student_session');
      }
    }
  }, []);

  // Fetch completion count from database
  const fetchCompletionCount = async (studentId: string) => {
    try {
      const { data, error } = await mongodb
        .from('user_scores')
        .select('completion_count')
        .eq('student_id', studentId)
        .single();
      
      if (data && !error) {
        setCompletionCount(data.completion_count || 0);
      }
    } catch (error) {
      console.error('Error fetching completion count:', error);
    }
  };

  useEffect(() => {
    if (studentData) {
      checkIfPlayedToday();
      fetchSocialScore();
      checkGameAvailability();
      fetchCompletionCount(studentData.id);
      
      // Persist session
      localStorage.setItem('student_session', JSON.stringify(studentData));
    }
  }, [studentData]);

  const checkGameAvailability = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await mongodb
      .from('word_puzzle')
      .select('id')
      .eq('game_date', today)
      .single();
    
    setGameAvailable(!!data);
  };

  const fetchSocialScore = async () => {
    if (!studentData) return;
    
    const { data } = await mongodb
      .from('students')
      .select('social_score')
      .eq('id', studentData.id)
      .single();
    
    setSocialScore(data?.social_score || 0);
  };

  const calculateSocialScoreByTime = (timeInSeconds: number): number => {
    if (timeInSeconds <= 150) { // 2.30 minutes
      return 5;
    } else if (timeInSeconds <= 210) { // 3.30 minutes
      return 3;
    } else if (timeInSeconds <= 270) { // 4.30 minutes
      return 2;
    } else {
      return 1;
    }
  };

  useEffect(() => {
    // Check if game is complete and trigger completion effects
    if (isGameComplete && foundWords.length === totalWords && studentData && !hasPlayedToday) {
      const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
      setFinalTime(timeTaken);
      

      
      // Show completion effect immediately but don't save yet
      setShowCompletionEffect(true);
    }
  }, [isGameComplete, foundWords.length, totalWords, studentData, hasPlayedToday, gameStartTime]);

  // Check if user has completed game and show appropriate message
  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (studentData && hasPlayedToday) {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if data exists in leaderboard_score
        const { data: leaderboardData } = await mongodb
          .from('leaderboard_score')
          .select('*')
          .eq('student_id', studentData.id)
          .eq('game_date', today)
          .eq('complete_game', true)
          .single();

        if (leaderboardData) {
          // Data exists in leaderboard_score - show completion message
          setShowCongratsModal(true);
        }
      }
    };

    checkCompletionStatus();
  }, [studentData, hasPlayedToday]);

  const saveGameCompletion = async () => {
    if (!studentData) return;



    try {
      // Use the new moveToLeaderboard function
      const success = await moveToLeaderboard(studentData);



      if (success) {
        // Check if this is a guest user
        const isGuest = studentData.admission_number === 'GUEST' || studentData.id.startsWith('guest-');

        if (!isGuest) {
          // Calculate time-based social score
          const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
          const timeBasedScore = calculateSocialScoreByTime(timeTaken);
          
          // Update students table social_score only for registered students
          const { data: currentStudent } = await mongodb
            .from('students')
            .select('social_score')
            .eq('id', studentData.id)
            .single();

          if (currentStudent) {
            const newSocialScore = (currentStudent.social_score || 0) + timeBasedScore;
            const { error: socialScoreError } = await mongodb
              .from('students')
              .eq('id', studentData.id)
              .update({ social_score: newSocialScore });

            if (socialScoreError) console.error('Error updating social score:', socialScoreError);
          }

          // Update social score display
          fetchSocialScore();
        }

        // Mark as played today
        setHasPlayedToday(true);

        // Clear browser local data
        localStorage.removeItem('currentGameData');
        localStorage.removeItem('canPlayToday');



        // Navigate to leaderboard page
        navigate('/leaderboard');

      } else {
        console.error('Failed to save game completion');
      }

    } catch (error) {
      console.error('Error saving game completion:', error);
    }
  };

  useEffect(() => {
    if (studentData) {
      const gameState = {
        studentData,
        foundWords,
        score,
        gameStartTime,
        hasPlayedToday,
        todayScore
      };
      localStorage.setItem(`gameState_${studentData.admission_number}`, JSON.stringify(gameState));
    }
  }, [studentData, foundWords, score, gameStartTime, hasPlayedToday, todayScore]);

  useEffect(() => {
    // Try to load saved state only if we don't have student data yet
    if (!studentData) {
      // Get all localStorage keys that match our pattern
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('gameState_')) {
          const savedState = localStorage.getItem(key);
          if (savedState) {
            try {
              const parsed = JSON.parse(savedState);
              if (parsed.studentData) {
                setStudentData(parsed.studentData);
                setGameStartTime(parsed.gameStartTime || 0);
                setHasPlayedToday(parsed.hasPlayedToday || false);
                setTodayScore(parsed.todayScore || null);
                break;
              }
            } catch (error) {
              console.error('Error loading saved state:', error);
            }
          }
        }
      }
    }
  }, [studentData]);

  useEffect(() => {
    const checkDailyReset = () => {
      if (!studentData) return;
      
      const today = new Date().toISOString().split('T')[0];
      const lastPlayDateKey = `lastPlayDate_${studentData.admission_number}`;
      const lastPlayDate = localStorage.getItem(lastPlayDateKey);
      
      if (lastPlayDate && lastPlayDate !== today) {
        // Reset for new day
        localStorage.removeItem(`game_${lastPlayDate}_${studentData.admission_number}`);
        localStorage.removeItem(`gameState_${studentData.admission_number}`);
        setHasPlayedToday(false);
        setTodayScore(null);
      }
      
      localStorage.setItem(lastPlayDateKey, today);
    };

    checkDailyReset();
    // Check every hour
    const interval = setInterval(checkDailyReset, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [studentData]);

  

  

  const checkIfPlayedToday = async () => {
    if (!studentData) return;

    // Use the updated checkTodayProgress function
    await checkTodayProgress(studentData.admission_number, studentData.id);
  };

  const handleLetterClick = React.useCallback((letter: string) => {
    // If in yesterday mode, switch to today's game first
    if (showYesterdayMode) {
      startTodayGame();
      return;
    }
    
    if (!hasPlayedToday && !isGameComplete && canPlayToday) {
      // Directly append the letter without processing
      setCurrentInput(prev => prev + letter);
    }
  }, [showYesterdayMode, hasPlayedToday, isGameComplete, canPlayToday, startTodayGame]);

  const handleEnter = () => {
    // If in yesterday mode, switch to today's game first
    if (showYesterdayMode) {
      startTodayGame();
      return;
    }
    
    if (!hasPlayedToday && !isGameComplete && canPlayToday && currentInput.length >= 2) {
      const word = currentInput.trim();
      
      // Increment attempt count for EVERY Enter press
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      // Check if word is already found
      if (foundWords.includes(word)) {
        setCurrentInput('');
        setWordNotification({ type: 'duplicate', word });
        
        // Save attempt count to database even for duplicate words
        if (studentData?.id) {
          const timingJson = JSON.stringify(wordTimings);
          const today = new Date().toISOString().split('T')[0];
          
          mongodb
            .from('user_scores')
            .eq('student_id', studentData.id)
            .update({
              attempt_count: newAttemptCount,
              last_played_date: today
            })
            .then(({ error }) => {
              if (error) console.error('Error updating attempt count:', error);
            });
        }
        return;
      }

      // Check if word is valid
      if (allValidWords.includes(word)) {
        const success = addWord(word, studentData?.id);
        if (success) {
          setCurrentInput('');
          setWordNotification({ type: 'correct', word });
          
          // Check if this was the last word
          const newFoundWordsCount = foundWords.length + 1;
          if (newFoundWordsCount === totalWords) {
            // All words found! Game should complete now.
          }
        }
      } else {
        setCurrentInput('');
        setWordNotification({ type: 'wrong', word });
        
        // Save attempt count to database even for invalid words
        if (studentData?.id) {
          const timingJson = JSON.stringify(wordTimings);
          const today = new Date().toISOString().split('T')[0];
          
          mongodb
            .from('user_scores')
            .eq('student_id', studentData.id)
            .update({
              attempt_count: newAttemptCount,
              last_played_date: today
            })
            .then(({ error }) => {
              if (error) console.error('Error updating attempt count:', error);
            });
        }
      }
    }
  };

  const handleDelete = () => {
    // If in yesterday mode, switch to today's game first
    if (showYesterdayMode) {
      startTodayGame();
      return;
    }
    
    if (!hasPlayedToday && !isGameComplete && canPlayToday) {
      setCurrentInput(prev => {
        const clusters = getGraphemeClusters(prev);
        if (clusters.length > 0) {
          return clusters.slice(0, -1).join('');
        }
        return prev;
      });
    }
  };

  const handleShuffle = () => {
    // If in yesterday mode, switch to today's game first
    if (showYesterdayMode) {
      startTodayGame();
      return;
    }
    
    if (!hasPlayedToday && !isGameComplete && canPlayToday) {
      shuffleLetters();
    }
  };

  const handleGameComplete = async () => {
    if (studentData && gameStartTime && !hasPlayedToday) {
      const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
      
      setHasPlayedToday(true);
      
      // Increment completion count
      const newCompletionCount = completionCount + 1;
      setCompletionCount(newCompletionCount);
      
      // Update completion count in database
      try {
        await mongodb
          .from('user_scores')
          .eq('student_id', studentData.id)
          .update({ completion_count: newCompletionCount });
      } catch (error) {
        console.error('Error updating completion count:', error);
      }
    }
  };

  const handleStudentLogin = async (student: Student) => {

    
    // Reset ALL game state for new user
    setHasPlayedToday(false);
    setTodayScore(null);
    setShowCompletionEffect(false);
    setShowCongratsModal(false);
    setCurrentInput('');
    setFoundWords([]);
    setWordTimings([]);
    setIsGameComplete(false);
    setWordNotification(null);
    setAttemptCount(0);
    
    setStudentData(student);
    
    // Check if user is in today's leaderboard first
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data: leaderboardEntry } = await mongodb
        .from('leaderboard_score')
        .select('*')
        .eq('admission_number', student.admission_number)
        .eq('game_date', today)
        .eq('complete_game', true)
        .single();

      if (leaderboardEntry) {
        // User has completed today's game - show completion analytics

        setHasPlayedToday(true);
        setIsGameComplete(true);
        setTodayScore({
          score: leaderboardEntry.score || 0,
          words_found: leaderboardEntry.words_found || 0,
          time_taken: leaderboardEntry.time_taken || 0,
          attempt_count: leaderboardEntry.attempt_count || 0
        });
        
        // Parse and set found words if available
        if (leaderboardEntry.found_words) {
          try {
            const words = JSON.parse(leaderboardEntry.found_words);
            setFoundWords(words);
          } catch (e) {
            console.error('Error parsing found words:', e);
          }
        }
        
        return;
      }
    } catch (error) {

    }
    
    // Reset game state in the hook and wait for it to finish
    await resetGame();
    
    // Check today's progress for this specific user
    try {
      const result = await checkTodayProgress(student.admission_number, student.id);

      
      // If it's a fresh start, initialize user progress
      if (result?.isFresh) {
        await initializeUserProgress(student.id, student.name, student.class, student.admission_number);
      }

      // Rely on checkTodayProgress result for game input state
      setIsGameInputDisabled(!result.canPlay);

      // If it's a fresh start, initialize user progress and local storage
      if (result?.isFresh) {
        await initializeUserProgress(student.id, student.name, student.class, student.admission_number);
        const today = new Date().toISOString().split('T')[0];
        const initialGameData = {
          admission_number: student.admission_number,
          name: student.name,
          class: student.class,
          foundCorrectWordsList: [],
          time: 0,
          attemptCount: 0,
          date: today,
        };
        localStorage.setItem('currentGameData', JSON.stringify(initialGameData));
        localStorage.setItem('canPlayToday', 'true'); // User can play
      } else if (result?.isComplete) {
        localStorage.setItem('canPlayToday', 'false'); // User cannot play
      } else if (result?.isOngoing) {
        localStorage.setItem('canPlayToday', 'true'); // User can continue playing
      }

    } catch (error) {
      console.error('Error checking progress or leaderboard:', error);
    }
  };

  const handleLogout = async () => {
    // Clear all stored data
    localStorage.removeItem('student_session');
    if (studentData) {
      localStorage.removeItem(`gameState_${studentData.admission_number}`);
      localStorage.removeItem(`lastPlayDate_${studentData.admission_number}`);
    }
    
    // Clear all game-related localStorage items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gameState_') || key.startsWith('lastPlayDate_') || key.startsWith('game_') || key === 'currentGameData' || key === 'canPlayToday') {
        localStorage.removeItem(key);
      }
    });
    
    // Reset all state
    setStudentData(null);
    setGameStartTime(0);
    setHasPlayedToday(false);
    setTodayScore(null);
    setSocialScore(0);
    setFinalTime(undefined);
    setFoundWords([]);
    setSessionPersisted(false);
    setCurrentInput('');
    setWordTimings([]);
    setIsGameComplete(false);
    setWordNotification(null);
    
    // Reset game state in the hook
    await resetGame();
  };

  const totalLettersCount = React.useMemo(() => {
    return allValidWords.reduce((sum, word) => {
      return sum + getGraphemeClusters(word).length;
    }, 0);
  }, [allValidWords]);

  if (!studentData) {
    return <LandingPage onLogin={handleStudentLogin} />;
  }

  if (hasPlayedToday && todayScore) {
    return <GameCompletionScreen 
      studentData={studentData}
      todayScore={todayScore}
      onLogout={handleLogout}
      onViewLeaderboard={() => navigate('/leaderboard')}
    />;
  }

  // Check if no game available for today
  if (!gameAvailable) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
            இன்று சொல்விளையாட்டு இல்லை
          </h2>
          <p className="text-gray-600 mb-6">Today's puzzle is not available. Please check back later.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-gray-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gray-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-100/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      {/* User Header */}
      <UserHeader
        userName={studentData.name}
        userClass={studentData.class}
        onLogout={handleLogout}
        isTestMode={true} // Set to false in production
      />
      
      {/* PWA Install Banner */}
      <PWAInstallBanner />
      
      <div className="pt-16">
        {/* Header */}
        <GameHeader
        isGameComplete={isGameComplete}
        onGameComplete={handleGameComplete}
        finalTime={hasPlayedToday ? todayTime : finalTime}
        time={time}
        score={foundWords.reduce((sum, word) => {
          return sum + getGraphemeClusters(word).length;
        }, 0)}
        totalScore={totalLettersCount}
        socialScore={socialScore}
        onLogout={handleLogout}
        username={studentData?.name}
        foundWordsCount={foundWords.length}
        totalWords={totalWords}
        headerVisible={headerVisible}
        controlHeader={controlHeader}
        level={getProgressLevel()}
        className={studentData?.class}
        showYesterdayMode={showYesterdayMode}
        onStartTodayGame={startTodayGame}
        completionCount={completionCount}
      />
      


      {/* Main Game Area - Mobile First Layout with Stunning Design */}
      <div className="flex-1 flex flex-col px-4 pb-4 min-h-0 relative z-10">
        {/* Desktop Layout */}
        <div className="hidden md:flex md:gap-8 md:max-w-7xl md:mx-auto h-full w-full">
          {/* Left Side - Game Controls */}
          <div className="flex-1 flex flex-col md:max-w-md">
            {(hasPlayedToday || isGameComplete) ? (
              <NextGameCountdown />
            ) : (
              <WordInput
                currentInput={currentInput}
                disabled={isGameInputDisabled || isGameComplete}
                showNotification={wordNotification}
                centerLetter={centerLetter}
                className="mb-4"
              />
            )}

            <div className="flex items-center justify-center min-h-0 mb-8 mt-8">
              <HexagonGrid 
                letters={surroundingLetters}
                centerLetter={centerLetter}
                onLetterClick={handleLetterClick}
                disabled={isGameInputDisabled || isGameComplete}
              />
            </div>

            <div className="mb-8">
              <GameControls 
                onDelete={handleDelete}
                onShuffle={handleShuffle}
                onEnter={handleEnter}
                canEnter={currentInput.length >= 2 && !hasPlayedToday && !isGameComplete}
                disabled={hasPlayedToday || isGameComplete}
              />
            </div>
          </div>

          

          <div className="md:flex-1 md:max-w-md">
            <DesktopWordsList
              allValidWords={allValidWords}
              foundWords={foundWords}
              message={getProgressMessage()}
              isGameComplete={isGameComplete}
              attemptCount={attemptCount}
              score={foundWords.reduce((sum, word) => sum + getGraphemeClusters(word).length, 0)}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col">
          {/* Progress & Motivation Section - Mobile */}
          <MotivationProgress 
            foundWordsCount={foundWords.length}
            totalWords={totalWords}
            time={time}
            finalTime={hasPlayedToday ? todayTime : finalTime}
            score={foundWords.reduce((sum, word) => sum + getGraphemeClusters(word).length, 0)}
            onViewWords={() => setShowWordsModal(true)}
            message={getProgressMessage()}
            isGameComplete={isGameComplete}
            attemptCount={attemptCount}
          />
          
          {/* Game Content Container */}
          <div className="flex flex-col space-y-2 mb-12">
            {/* Word Input or Next Game Countdown */}
            {(hasPlayedToday || isGameComplete) ? (
              <NextGameCountdown />
            ) : (
              <WordInput
                currentInput={currentInput}
                disabled={isGameInputDisabled || isGameComplete}
                showNotification={wordNotification}
                centerLetter={centerLetter}
              />
            )}

            {/* Hexagon Grid */}
            <div className="flex items-center justify-center py-6 mb-6">
              <HexagonGrid 
                letters={surroundingLetters}
                centerLetter={centerLetter}
                onLetterClick={handleLetterClick}
                disabled={isGameInputDisabled || isGameComplete}
              />
            </div>
            
            {/* Controls - Below hexagon with spacing */}
            <br/><div className="mt-16 mb-8">
              <GameControls 
                onDelete={handleDelete}
                onShuffle={handleShuffle}
                onEnter={handleEnter}
                canEnter={currentInput.length >= 2 && !hasPlayedToday && !isGameComplete}
                disabled={isGameInputDisabled || isGameComplete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WordsModal 
        isOpen={showWordsModal}
        onClose={() => setShowWordsModal(false)}
        foundWords={foundWords}
        allValidWords={allValidWords}
        totalWords={totalWords}
        studentId={studentData?.id}
        initialTab={activeTab}
      />

      <CongratsModal 
        isOpen={showCongratsModal}
        onClose={() => setShowCongratsModal(false)}
        foundWords={foundWords}
        score={foundWords.reduce((sum, word) => {
          return sum + getGraphemeClusters(word).length;
        }, 0)}
        attemptCount={attemptCount}
        timeTaken={todayTime}
        onPlayAgain={resetGame}
      />

      <CompletionEffect 
        isOpen={showCompletionEffect}
        onClose={() => {
          setShowCompletionEffect(false);
          // Save to database when user clicks "Continue"
          if (studentData) {
            saveGameCompletion();
          }
        }}
        timeTaken={finalTime || 0}
        score={foundWords.reduce((sum, word) => sum + getGraphemeClusters(word).length, 0)}
        attemptCount={attemptCount}
        totalScore={socialScore}
      />



      <DetailedLogModal 
        isOpen={showDetailedLogModal}
        onClose={() => setShowDetailedLogModal(false)}
        wordTimings={wordTimings}
      />

      
      </div>
    </div>
  );
};

export default Index;
