import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { mongodb } from '@/integrations/mongodb/client';
import { getGraphemeClusters } from '@/utils/tamilUtils';
import WordBlocksList from './WordBlocksList';
import GoogleAds from './GoogleAds';

interface YesterdayWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const YesterdayWordsModal = ({ isOpen, onClose }: YesterdayWordsModalProps) => {
  const [yesterdayWords, setYesterdayWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [yesterdayDate, setYesterdayDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchYesterdayWords();
    }
  }, [isOpen]);

  const fetchYesterdayWords = async () => {
    setLoading(true);
    try {
      // Get yesterday's date - using local timezone
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      // Format as YYYY-MM-DD in local timezone
      const year = yesterday.getFullYear();
      const month = String(yesterday.getMonth() + 1).padStart(2, '0');
      const day = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayStr = `${year}-${month}-${day}`;
      
      setYesterdayDate(yesterdayStr);
      


      // Fetch yesterday's game data
      const { data: gameData, error } = await mongodb
        .from('word_puzzle')
        .select('*')
        .eq('game_date', yesterdayStr)
        .single();



      if (error) {
        console.error('Database error:', error);
        setYesterdayWords([]);
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
        ].filter(word => word && word.trim() !== ''); // Filter out empty strings
        

        setYesterdayWords(allWords);
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
          // Combine all word arrays from different length categories
          const allWords = [
            ...(fallbackData.words_2_letter || []),
            ...(fallbackData.words_3_letter || []),
            ...(fallbackData.words_4_letter || []),
            ...(fallbackData.words_5_letter || []),
            ...(fallbackData.words_6_letter || []),
            ...(fallbackData.words_7_letter || [])
          ].filter(word => word && word.trim() !== ''); // Filter out empty strings
          

          setYesterdayDate(fallbackData.game_date);
          setYesterdayWords(allWords);
        } else {
          // Let's also check what dates are available
          const { data: allDates } = await mongodb
            .from('word_puzzle')
            .select('game_date')
            .order('game_date', { ascending: false })
            .limit(10);

          setYesterdayWords([]);
        }
      }
    } catch (error) {
      console.error('Error fetching yesterday words:', error);
      setYesterdayWords([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                  நேற்றைய சொற்கள்
                </h2>
                <p className="text-green-100 text-sm">
                  {new Date(yesterdayDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Banner Ad above yesterday words */}
        <div className="p-4 border-b border-gray-200">
          <GoogleAds 
            adSlot="6833809490"
            adFormat="fluid"
            adLayoutKey="-fd+b+v-54+5s"
            style={{ minHeight: '100px' }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : yesterdayWords.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                நேற்றைய விளையாட்டு கிடைக்கவில்லை
              </p>
            </div>
          ) : (
            <div>
              <WordBlocksList 
                allValidWords={yesterdayWords} 
                foundWords={yesterdayWords} 
                isSmall={false}
              />
              
              {/* <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mt-6">
                <p className="text-sm text-blue-800" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                  மொத்தம் <strong>{yesterdayWords.length}</strong> சொற்கள் கண்டுபிடிக்க வேண்டியிருந்தது
                </p>
              </div> */}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200"
          >
            மூடு
          </button>
        </div>
      </div>
    </div>
  );
};

export default YesterdayWordsModal;