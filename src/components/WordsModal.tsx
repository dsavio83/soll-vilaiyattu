
import React, { useState, useEffect } from 'react';
import { X, Calendar, Eye } from 'lucide-react';
import { getGraphemeClusters } from '@/utils/tamilUtils';
import { mongodb } from '@/integrations/mongodb/client';
import WordBlocksList from './WordBlocksList';
interface WordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  foundWords: string[];
  allValidWords: string[];
  totalWords: number;
  studentId?: string;
  initialTab?: 'today' | 'yesterday';
  yesterdayOnly?: boolean;
}

const WordsModal = ({
  isOpen,
  onClose,
  foundWords,
  allValidWords,
  totalWords,
  studentId,
  initialTab = 'today',
  yesterdayOnly = false
}: WordsModalProps) => {
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday'>('today');
  const [yesterdayWords, setYesterdayWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isYesterdayOnly, setIsYesterdayOnly] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchYesterdayWords(studentId);
    }
  }, [isOpen, studentId]);
  
  // Update active tab when modal opens - check if it's yesterday only mode
  useEffect(() => {
    if (isOpen) {
      setIsYesterdayOnly(yesterdayOnly || initialTab === 'yesterday');
      setActiveTab(yesterdayOnly ? 'yesterday' : (initialTab || 'today'));
    }
  }, [isOpen, initialTab, yesterdayOnly]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchYesterdayWords = async (studentId: string) => {
    setIsLoading(true);
    try {
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Fetch yesterday's puzzle data from word_puzzle table
      const { data } = await mongodb
        .from('word_puzzle')
        .select('*')
        .eq('game_date', yesterdayStr)
        .single();
      
      if (data) {
        // Collect all valid words from yesterday's puzzle
        const allWords = [
          ...(data.words_7_letter || []),
          ...(data.words_6_letter || []),
          ...(data.words_5_letter || []),
          ...(data.words_4_letter || []),
          ...(data.words_3_letter || []),
          ...(data.words_2_letter || [])
        ].filter(word => word && word.trim());
        
        // Sort by letter count (descending: 7→6→5→4→3→2)
        const sortedWords = allWords.sort((a, b) => {
          const aLength = getGraphemeClusters(a).length;
          const bLength = getGraphemeClusters(b).length;
          return bLength - aLength;
        });
        
        setYesterdayWords(sortedWords);
      } else {
        setYesterdayWords([]);
      }
    } catch (error) {
      console.error('Error fetching yesterday words:', error);
      setYesterdayWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const sortedFoundWords = [...foundWords].sort((a, b) => getGraphemeClusters(b).length - getGraphemeClusters(a).length);

  // Group words by length and only show groups that have words

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              Found Words: {foundWords.length}/{totalWords}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <WordBlocksList allValidWords={allValidWords} foundWords={foundWords} isSmall={isMobile} />
        </div>
      </div>
    </div>
  );
};

export default WordsModal;
