import { useState, useEffect } from 'react';
import { mongodb } from '@/integrations/mongodb/client';
import { useToast } from '@/hooks/use-toast';
import { getGraphemeClusters } from '@/utils/tamilUtils';
import { Tables } from '@/integrations/mongodb/types';

type GameData = Tables<'word_puzzle'>;
type Student = Tables<'students'>;

interface WordTiming {
  word: string;
  time: number;
  timestamp: number;
}

export const useGameState = () => {
  const [currentInput, setCurrentInput] = useState('');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [surroundingLetters, setSurroundingLetters] = useState<string[]>([]);
  const [centerLetter, setCenterLetter] = useState('');
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [allValidWords, setAllValidWords] = useState<string[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [todayScore, setTodayScore] = useState(0);
  const [todayTime, setTodayTime] = useState(0);
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [showYesterdayMode, setShowYesterdayMode] = useState(false);
  const [yesterdayWords, setYesterdayWords] = useState<string[]>([]);
  const [canPlayToday, setCanPlayToday] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadTodaysGame();
    
    // Set up daily reset at midnight IST
    const checkMidnightReset = () => {
      const now = new Date();
      
      // Convert to IST
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istNow = new Date(now.getTime() + istOffset);
      
      // Calculate next midnight IST
      const nextMidnightIST = new Date(istNow);
      nextMidnightIST.setHours(24, 0, 0, 0);
      
      // Convert back to local time
      const nextMidnightLocal = new Date(nextMidnightIST.getTime() - istOffset);
      const timeUntilMidnight = nextMidnightLocal.getTime() - now.getTime();
      
      setTimeout(async () => {
        // Clear user_scores table at midnight IST
        await clearUserScoresDaily();
        
        // Reset game state at midnight
        setShowYesterdayMode(false);
        setYesterdayWords([]);
        setCanPlayToday(true);
        setFoundWords([]);
        setWordTimings([]);
        setIsGameComplete(false);
        setHasPlayedToday(false);
        setTodayScore(0);
        setTodayTime(0);
        setCurrentInput('');
        setAttemptCount(0);
        
        // Load new day's game
        loadTodaysGame();
        
        // Set up next day's reset
        checkMidnightReset();
      }, timeUntilMidnight);
    };
    
    checkMidnightReset();
  }, []);

  const clearUserScoresDaily = async () => {
    try {

      const { error } = await mongodb
        .from('user_scores')
        .neq('_id', '000000000000000000000000') // Delete all records
        .delete();
      
      if (error) {
        console.error('Error clearing user_scores:', error);
      }
    } catch (error) {
      console.error('Error in clearUserScoresDaily:', error);
    }
  };

  const checkTodayProgress = async (admissionNumber?: string, studentId?: string) => {
    if (!admissionNumber || !studentId) return { canPlay: true, showYesterday: false };
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // First check if already completed in leaderboard_score
      const { data: leaderboardData } = await mongodb
        .from('leaderboard_score')
        .eq('student_id', studentId)
        .eq('game_date', today)
        .eq('complete_game', true)
        .single();

      if (leaderboardData) {
        // Game already completed - show completion message with all data
        setHasPlayedToday(true);
        setTodayScore(leaderboardData.score || 0);
        setTodayTime(leaderboardData.time_taken || 0);
        setAttemptCount(leaderboardData.attempt_count || 0);
        setIsGameComplete(true);
        
        if (leaderboardData.found_words) {
          try {
            const savedFoundWords = JSON.parse(leaderboardData.found_words);
            setFoundWords(savedFoundWords);
          } catch (e) {
            console.error('Error parsing found words:', e);
            setFoundWords([]);
          }
        }
        
        if (leaderboardData.found_words_time) {
          try {
            const timingData = JSON.parse(leaderboardData.found_words_time);
            setWordTimings(timingData);
          } catch (e) {
            console.error('Error parsing word timings:', e);
            setWordTimings([]);
          }
        }
        
        return { canPlay: false, showYesterday: false, isComplete: true };
      }

      // Check user_scores for ongoing game
      const { data: userScoreData } = await mongodb
        .from('user_scores')
        .eq('student_id', studentId)
        .single();

      if (userScoreData && userScoreData.last_played_date === today) {
        // User has ongoing game today - continue from where left off

        
        setHasPlayedToday(false);
        setIsGameComplete(false);
        setAttemptCount(userScoreData.attempt_count || 0);
        
        if (userScoreData.found_words_list) {
          setFoundWords(userScoreData.found_words_list);
        }
        
        if (userScoreData.found_words_time) {
          try {
            const timingData = JSON.parse(userScoreData.found_words_time);
            setWordTimings(timingData);
          } catch (e) {
            console.error('Error parsing word timings:', e);
            setWordTimings([]);
          }
        }
        
        // Restore game start time from database
        if (userScoreData.game_start_time) {
          setGameStartTime(userScoreData.game_start_time);
        } else {
          // Fallback: calculate from first word timing or use current time
          if (userScoreData.found_words_time) {
            try {
              const timingData = JSON.parse(userScoreData.found_words_time);
              if (timingData.length > 0) {
                setGameStartTime(timingData[0].timestamp);
              } else {
                setGameStartTime(Date.now());
              }
            } catch (e) {
              setGameStartTime(Date.now());
            }
          } else {
            setGameStartTime(Date.now());
          }
        }
        
        setShowYesterdayMode(false);
        setCanPlayToday(true);
        return { canPlay: true, showYesterday: false, isOngoing: true };
      }

      // Fresh start - user details not in user_scores table

      setHasPlayedToday(false);
      setIsGameComplete(false);
      setShowYesterdayMode(false);
      setCanPlayToday(true);
      setFoundWords([]);
      setWordTimings([]);
      setAttemptCount(0);
      
      // We need student data to initialize, this will be handled in Index.tsx
      return { canPlay: true, showYesterday: false, isFresh: true };
      
    } catch (error) {
      console.error('Error checking progress:', error);
      return { canPlay: true, showYesterday: false };
    }
  };

  const loadYesterdayWords = async () => {
    try {
      // Get yesterday's date
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const year = yesterday.getFullYear();
      const month = String(yesterday.getMonth() + 1).padStart(2, '0');
      const day = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayStr = `${year}-${month}-${day}`;

      // Fetch yesterday's game data
      const { data: gameData, error } = await mongodb
        .from('word_puzzle')
        .select('*')
        .eq('game_date', yesterdayStr)
        .single();

      if (error) {
        console.error('Error loading yesterday words:', error);
        return;
      }

      if (gameData) {
        // Combine all word arrays from different length categories
        const allWords = [
          ...(gameData.words_2_letter || []),
          ...(gameData.words_3_letter || []),
          ...(gameData.words_4_letter || []),
          ...(gameData.words_5_letter || []),
          ...(gameData.words_6_letter || []),
          ...(gameData.words_7_letter || [])
        ].filter(word => word && word.trim() !== '');
        
        setYesterdayWords(allWords);
        setFoundWords(allWords); // Show all yesterday's words as found
        
        // Set yesterday's letters (disabled)
        const center = getGraphemeClusters(gameData.center_letter)[0] || '';
        setCenterLetter(center);
        
        const surroundingString = Array.isArray(gameData.surrounding_letters) ? gameData.surrounding_letters.join(',') : String(gameData.surrounding_letters);
        let surrounding = surroundingString.split(',').map(l => l.trim()).filter(Boolean);
        
        // Ensure exactly 6 letters for yesterday mode too
        while (surrounding.length < 6) {
          surrounding.push(center);
        }
        
        setSurroundingLetters(surrounding.slice(0, 6));
      } else {
        // Fallback: Try to get the most recent game before today
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const { data: fallbackData } = await mongodb
          .from('word_puzzle')
          .select('*')
          .lte('game_date', todayStr)
          .order('game_date', { ascending: false })
          .limit(1)
          .single();
          
        if (fallbackData) {
          const allWords = [
            ...(fallbackData.words_2_letter || []),
            ...(fallbackData.words_3_letter || []),
            ...(fallbackData.words_4_letter || []),
            ...(fallbackData.words_5_letter || []),
            ...(fallbackData.words_6_letter || []),
            ...(fallbackData.words_7_letter || [])
          ].filter(word => word && word.trim() !== '');
          
          setYesterdayWords(allWords);
          setFoundWords(allWords);
          
          const center = getGraphemeClusters(fallbackData.center_letter)[0] || '';
          setCenterLetter(center);
          
          const surroundingString = Array.isArray(fallbackData.surrounding_letters) ? fallbackData.surrounding_letters.join(',') : String(fallbackData.surrounding_letters);
          let surrounding = surroundingString.split(',').map(l => l.trim()).filter(Boolean);
          
          // Ensure exactly 6 letters for fallback data too
          while (surrounding.length < 6) {
            surrounding.push(center);
          }
          
          setSurroundingLetters(surrounding.slice(0, 6));
        }
      }
    } catch (error) {
      console.error('Error loading yesterday words:', error);
    }
  };

  const initializeUserProgress = async (studentId: string, studentName: string, studentClass: string, admissionNumber: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startTime = Date.now();
      

      
      const { error } = await mongodb
        .from('user_scores')
        .upsert({
          student_id: studentId,
          found_words_time: JSON.stringify([]),
          total_score: 0,
          attempt_count: 0,
          last_played_date: today
        });

      if (error) {
        console.error('Error initializing user progress:', error);
      } else {
        setGameStartTime(startTime);
      }
    } catch (error) {
      console.error('Error initializing user progress:', error);
    }
  };

  const saveProgressToDatabase = async (studentId: string, words: string[], timings: WordTiming[], score: number, attempts: number, startTime?: number) => {
    try {
      const timingJson = JSON.stringify(timings);
      const today = new Date().toISOString().split('T')[0];
      

      
      // Use UPDATE instead of UPSERT to ensure we only update existing row
      const { error } = await mongodb
        .from('user_scores')
        .eq('student_id', studentId)
        .update({
          found_words_time: timingJson,
          total_score: score,
          attempt_count: attempts,
          last_played_date: today
        });

      if (error) {
        console.error('Error updating user_scores:', error);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const loadTodaysGame = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await mongodb
        .from('word_puzzle')
        .select('*')
        .eq('game_date', today)
        .single();

      if (error) {
        console.error('Error loading game:', error);
        setDefaultGame();
        return;
      }

      if (data) {

        
        const center = getGraphemeClusters(data.center_letter)[0] || '';


        const surroundingString = Array.isArray(data.surrounding_letters) ? data.surrounding_letters.join(',') : String(data.surrounding_letters);
        let surrounding = surroundingString.split(',').map(l => l.trim()).filter(Boolean);
        
        // Ensure exactly 6 letters
        while (surrounding.length < 6) {
          surrounding.push(center);
        }
        surrounding = surrounding.slice(0, 6);
        
        const finalSurrounding = shuffleArray(surrounding);
        
        setGameData(data);
        setCenterLetter(center);
        
        setSurroundingLetters(finalSurrounding);
        
        // Collect all valid words with proper Tamil character handling
        const validWords = [
          ...(data.words_2_letter || []),
          ...(data.words_3_letter || []),
          ...(data.words_4_letter || []),
          ...(data.words_5_letter || []),
          ...(data.words_6_letter || []),
          ...(data.words_7_letter || [])
        ].filter(word => word && word.trim());
        
        setAllValidWords(validWords);
        setTotalWords(validWords.length);
      } else {
        setDefaultGame();
      }
    } catch (error) {
      console.error('Error:', error);
      setDefaultGame();
    }
  };

  const setDefaultGame = () => {
    // Don't set any default data - only use database data

    
    // Temporary test data for debugging
    const testCenterLetter = 'க';
    const testSurroundingLetters = ['ல', 'த', 'ங', 'ப', 'ள', 'ம'];
    
    setCenterLetter(testCenterLetter);
    setSurroundingLetters(testSurroundingLetters);
    setAllValidWords(['கல', 'கத', 'கம']); // Sample words
    setTotalWords(3);
    

  };

  const startTodayGame = async () => {
    if (showYesterdayMode) {
      setShowYesterdayMode(false);
      setCanPlayToday(true);
      setFoundWords([]);
      setYesterdayWords([]);
      await loadTodaysGame();
    }
  };

  const addWord = (word: string, studentId?: string) => {
    if (hasPlayedToday) return false;
    
    // If in yesterday mode, switch to today's game first
    if (showYesterdayMode) {
      startTodayGame();
      return false; // Don't add word yet, let user try again
    }

    const normalizedWord = word.trim();
    const wordLength = getGraphemeClusters(normalizedWord).length;
    
    if (wordLength < 2) {
      return false;
    }

    if (!normalizedWord.includes(centerLetter)) {
      return false;
    }

    if (foundWords.includes(normalizedWord)) {
      return false;
    }

    if (!allValidWords.includes(normalizedWord)) {
      return false;
    }

    const newFoundWords = [...foundWords, normalizedWord].sort((a, b) => {
      const lengthA = getGraphemeClusters(a).length;
      const lengthB = getGraphemeClusters(b).length;
      return lengthB - lengthA;
    });
    setFoundWords(newFoundWords);

    // Record timing for this word
    const currentTime = Date.now();
    const timeFromStart = gameStartTime ? Math.floor((currentTime - gameStartTime) / 1000) : 0;
    const newTiming: WordTiming = {
      word: normalizedWord,
      time: timeFromStart,
      timestamp: currentTime
    };
    
    const newTimings = [...wordTimings, newTiming];
    setWordTimings(newTimings);

    // Calculate score based on Tamil grapheme length
    const newScore = newFoundWords.reduce((sum, w) => sum + getGraphemeClusters(w).length, 0);
    const isComplete = newFoundWords.length === totalWords;
    
    // Save progress to database immediately after each word
    if (studentId) {

      saveProgressToDatabase(studentId, newFoundWords, newTimings, newScore, attemptCount, gameStartTime);
    }

    if (isComplete) {

      setIsGameComplete(true);
      setTodayScore(newScore);
      setTodayTime(timeFromStart);
    }

    return true;
  };

  const resetGame = async () => {
    setCurrentInput('');
    setFoundWords([]);
    setWordTimings([]);
    setIsGameComplete(false);
    setHasPlayedToday(false);
    setTodayScore(0);
    setTodayTime(0);
    setShowYesterdayMode(false);
    setYesterdayWords([]);
    setCanPlayToday(true);
    setAttemptCount(0);
    setGameStartTime(Date.now());
    await loadTodaysGame();
  };

  const shuffleLetters = () => {
    if (hasPlayedToday || showYesterdayMode) return;
    setSurroundingLetters(prev => shuffleArray(prev));
  };

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getProgressMessage = () => {
    if (hasPlayedToday) {
      return "Game completed for today!";
    }
    
    const wordsFound = foundWords.length;
    if (wordsFound === 0) return "துவக்க நிலை!";
    if (wordsFound === 1) return "நல்ல தொடக்கம்!";
    if (wordsFound === 2) return "சூப்பர் அப்படிதான்!";
    if (wordsFound === 3) return "தொடர்ந்து முன்னேறுங்கள்!!";
    if (wordsFound === 4) return "நன்றாக செயல்படுகிறீர்கள்!";
    if (wordsFound === 5) return "இன்னம்கொஞ்சம்தான்";
    if (wordsFound === 6) return "சூப்பர் அப்படிதான்!";
    if (wordsFound === totalWords - 1) return "இன்னும் ஒன்றுதான்!";
    if (wordsFound === totalWords) return "நீங்க ஜீனியர்தான்!";
    
    // Fallback for other cases based on progress
    const percentage = totalWords > 0 ? Math.round((foundWords.length / totalWords) * 100) : 0;
    if (percentage < 15) return "நல்ல தொடக்கம்!";
    if (percentage < 30) return "சூப்பர் அப்படிதான்!";
    if (percentage < 50) return "தொடர்ந்து முன்னேறுங்கள்!!";
    if (percentage < 70) return "நன்றாக செயல்படுகிறீர்கள்!";
    if (percentage < 85) return "இன்னம்கொஞ்சம்தான்";
    return "இன்னும் ஒன்றுதான்!";
  };

  const getProgressLevel = () => {
    const percentage = totalWords > 0 ? (foundWords.length / totalWords) * 100 : 0;
    if (percentage < 25) return 1;
    if (percentage < 50) return 2;
    if (percentage < 75) return 3;
    if (percentage < 100) return 4;
    return 5;
  };

  const moveToLeaderboard = async (studentData: Student) => {
    if (!studentData || foundWords.length === 0) {
      console.log('Missing studentData or foundWords');
      return false;
    }

    try {
      const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;

      // Get the student ID - use _id for MongoDB, fallback to admission_number
      const studentId = studentData._id || studentData.id || studentData.admission_number;
      
      if (!studentId) {
        console.error('No student ID found:', studentData);
        return false;
      }
      

      
      // Check if this is a guest user
      const isGuest = studentData.admission_number === 'GUEST' || String(studentId).startsWith('guest-');
      
      if (isGuest) {
        // Handle guest user data saving - for guests, just save to leaderboard
        // Check for duplicate guest entries
        const today = new Date().toISOString().split('T')[0];
        const { data: existingGuestEntry } = await mongodb
          .from('leaderboard_score')
          .eq('student_id', String(studentId))
          .eq('game_date', today)
          .single();

        if (existingGuestEntry) {
  
          return true;
        }

        const { error } = await mongodb
          .from('leaderboard_score')
          .insert([{
            student_id: String(studentId),
            admission_number: studentData.admission_number,
            name: studentData.name,
            class: studentData.class || 'Guest',
            score: score,
            time_taken: timeTaken,
            words_found: foundWords.length,
            found_words: JSON.stringify(foundWords),
            found_words_time: JSON.stringify(wordTimings),
            complete_game: true,
            attempt_count: attemptCount,
            game_date: today
          }]);

        if (error) {
          console.error('Error saving guest user data:', error);
          return false;
        }


        return true;
      } else {
        // Handle regular student data saving - move to leaderboard and delete from user_scores
        const today = new Date().toISOString().split('T')[0];
        
        // Check if already exists to prevent duplicates
        const { data: existingEntry } = await mongodb
          .from('leaderboard_score')
          .eq('student_id', String(studentId))
          .eq('game_date', today)
          .single();

        if (existingEntry) {

          return true;
        }

        // Insert into leaderboard_score
        const { error: leaderboardError } = await mongodb
          .from('leaderboard_score')
          .insert([{
            student_id: String(studentId),
            admission_number: studentData.admission_number,
            name: studentData.name,
            class: studentData.class,
            score: score,
            time_taken: timeTaken,
            words_found: foundWords.length,
            found_words: JSON.stringify(foundWords),
            found_words_time: JSON.stringify(wordTimings),
            complete_game: true,
            attempt_count: attemptCount,
            game_date: today
          }]);

        if (leaderboardError) {
          console.error('Error saving to leaderboard:', leaderboardError);
          return false;
        }



        // Delete from user_scores
        const { error: deleteError } = await mongodb
          .from('user_scores')
          .eq('student_id', String(studentId))
          .delete();

        if (deleteError) {
          console.error('Error deleting from user_scores:', deleteError);
          // Don't return false here as the main operation (saving to leaderboard) succeeded
        }

        return true;
      }
    } catch (error) {
      console.error('Error in moveToLeaderboard:', error);
      return false;
    }
  };

  // Calculate score based on total grapheme clusters found (1 point per Tamil grapheme)
  const score = foundWords.reduce((sum, word) => sum + getGraphemeClusters(word).length, 0);

  return {
    currentInput,
    setCurrentInput,
    foundWords,
    score: hasPlayedToday ? todayScore : score,
    surroundingLetters,
    centerLetter,
    isGameComplete,
    setIsGameComplete,
    totalWords,
    allValidWords,
    hasPlayedToday,
    setHasPlayedToday,
    setFoundWords,
    todayTime,
    wordTimings,
    setWordTimings,
    gameStartTime,
    setGameStartTime,
    showYesterdayMode,
    yesterdayWords,
    canPlayToday,
    startTodayGame,
    addWord,
    resetGame,
    shuffleLetters,
    getProgressMessage,
    getProgressLevel,
    checkTodayProgress,
    moveToLeaderboard,
    initializeUserProgress,
    attemptCount,
    setAttemptCount
  };
};
