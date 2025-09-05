
import React, { useState } from 'react';
import { mongodb } from '@/integrations/mongodb/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { isValidTamilWord, getGraphemeClusters } from '@/utils/tamilUtils';
import { Plus, Trash2 } from 'lucide-react';

interface AddGameFormProps {
  editingGame?: any;
  onGameSaved?: () => void;
}

const AddGameForm = ({ editingGame, onGameSaved }: AddGameFormProps) => {
  const [loading, setLoading] = useState(false);
  const [wordErrors, setWordErrors] = useState<Record<number, Record<number, string | undefined>>>({});
  const [formData, setFormData] = useState({
    game_date: '',
    center_letter: '',
    surrounding_letters: '',
  });

  const [wordInputs, setWordInputs] = useState({
    2: [''],
    3: [''],
    4: [''],
    5: [''],
    6: [''],
    7: [''],
  });

  const { toast } = useToast();

  React.useEffect(() => {
    if (editingGame) {
      const rawSurrounding = editingGame.surrounding_letters || [];
      const cleanedSurroundingString = rawSurrounding.join(',').split(',').map(s => s.trim()).filter(Boolean).join(', ');

      setFormData({
        game_date: editingGame.game_date || new Date().toISOString().split('T')[0],
        center_letter: editingGame.center_letter || '',
        surrounding_letters: cleanedSurroundingString,
      });
      setWordInputs({
        2: editingGame.words_2_letter && editingGame.words_2_letter.length > 0 ? editingGame.words_2_letter : [''],
        3: editingGame.words_3_letter && editingGame.words_3_letter.length > 0 ? editingGame.words_3_letter : [''],
        4: editingGame.words_4_letter && editingGame.words_4_letter.length > 0 ? editingGame.words_4_letter : [''],
        5: editingGame.words_5_letter && editingGame.words_5_letter.length > 0 ? editingGame.words_5_letter : [''],
        6: editingGame.words_6_letter && editingGame.words_6_letter.length > 0 ? editingGame.words_6_letter : [''],
        7: editingGame.words_7_letter && editingGame.words_7_letter.length > 0 ? editingGame.words_7_letter : [''],
      });
    } else {
      setFormData({
        game_date: new Date().toISOString().split('T')[0],
        center_letter: '',
        surrounding_letters: '',
      });
      setWordInputs({ 2: [''], 3: [''], 4: [''], 5: [''], 6: [''], 7: [''] });
    }
  }, [editingGame]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addWordInput = (length: number) => {
    setWordInputs(prev => ({
      ...prev,
      [length]: [...prev[length], '']
    }));
  };

  const removeWordInput = (length: number, index: number) => {
    setWordInputs(prev => ({
      ...prev,
      [length]: prev[length].filter((_, i) => i !== index)
    }));
  };

  const updateWordInput = (length: number, index: number, value: string) => {
    const { center_letter } = formData;
    let error: string | undefined = undefined;

    if (value.trim()) { // Only validate if there is some text
      const validation = isValidTamilWord(value, center_letter, length);
      if (!validation.isValid) {
        error = validation.error;
      }
    }

    setWordErrors(prev => ({
      ...prev,
      [length]: { ...prev[length], [index]: error }
    }));

    setWordInputs(prev => ({
      ...prev,
      [length]: prev[length].map((word, i) => (i === index ? value : word))
    }));
  };

  const handleImportWords = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split(/\r?\n+/).filter(line => line.trim() !== ''); // Split by new line(s) and filter empty lines
      
      const importedWords: Record<number, string[]> = { 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
      let errorCount = 0;

      lines.forEach(line => {
        // Handle comma-separated words on a single line
        const wordsInLine = line.split(',').map(word => word.trim()).filter(word => word !== '');

        wordsInLine.forEach(word => {
          const graphemes = getGraphemeClusters(word);
          const length = graphemes.length;

          if (length >= 2 && length <= 7) {
            const validation = isValidTamilWord(word, formData.center_letter, length); // Use current center letter for validation
            if (validation.isValid) {
              importedWords[length].push(word);
            } else {
              errorCount++;
              console.warn(`Invalid word "${word}" (length ${length}): ${validation.error}`);
            }
          }
        });
      });

      setWordInputs(prev => {
        const newWordInputs = { ...prev };
        for (const length in importedWords) {
          // Append imported words, ensuring at least one empty input if no words imported for that length
          newWordInputs[length] = [...new Set([...prev[length].filter(w => w.trim() !== ''), ...importedWords[length]])];
          if (newWordInputs[length].length === 0) {
            newWordInputs[length].push('');
          }
        }
        return newWordInputs;
      });

      if (errorCount > 0) {
        toast({
          title: "Import Completed with Warnings",
          description: `${lines.length - errorCount} words imported. ${errorCount} words skipped due to errors (check console for details).`,
          variant: "warning",
        });
      } else {
        toast({
          title: "Import Successful",
          description: `${lines.length} words imported successfully.`,
        });
      }
    };
    reader.readAsText(file);
    // Clear the file input value to allow re-importing the same file
    event.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.game_date || !formData.center_letter || !formData.surrounding_letters) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Date, Center Letter, Surrounding Letters).",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate surrounding letters
      const surroundingLettersArray = formData.surrounding_letters.split(',').map(s => s.trim()).filter(Boolean);
      
      // Check if exactly 6 surrounding letters
      if (surroundingLettersArray.length !== 6) {
        toast({
          title: "Validation Error",
          description: "Please provide exactly 6 surrounding letters separated by commas.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Allow duplicate surrounding letters - remove this validation
      // const uniqueSurroundingLetters = new Set(surroundingLettersArray);
      // if (uniqueSurroundingLetters.size !== surroundingLettersArray.length) {
      //   toast({
      //     title: "Validation Error", 
      //     description: "Surrounding letters must be unique. Please remove duplicate letters.",
      //     variant: "destructive",
      //   });
      //   setLoading(false);
      //   return;
      // }

      

      // Check for validation errors before submitting
      for (const length in wordErrors) {
        for (const index in wordErrors[length]) {
          if (wordErrors[length][index]) {
            toast({
              title: "Validation Error",
              description: "Please fix all validation errors before submitting.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }
      }

      // Collect all words and check for duplicates
      const allWords: string[] = [];
      const wordCategories = [
        wordInputs[2].filter(w => w.trim()),
        wordInputs[3].filter(w => w.trim()),
        wordInputs[4].filter(w => w.trim()),
        wordInputs[5].filter(w => w.trim()),
        wordInputs[6].filter(w => w.trim()),
        wordInputs[7].filter(w => w.trim()),
      ];

      wordCategories.forEach(category => {
        allWords.push(...category);
      });

      // Check for duplicate words
      const uniqueWords = new Set(allWords);
      if (uniqueWords.size !== allWords.length) {
        const duplicates = allWords.filter((word, index) => allWords.indexOf(word) !== index);
        toast({
          title: "Duplicate Words Found",
          description: `These words are duplicated: ${[...new Set(duplicates)].join(', ')}. Each word must be unique.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const gameData = {
        game_date: formData.game_date,
        center_letter: formData.center_letter.trim(),
        surrounding_letters: surroundingLettersArray, // Already validated and processed
        words_2_letter: wordInputs[2].filter(w => w.trim()),
        words_3_letter: wordInputs[3].filter(w => w.trim()),
        words_4_letter: wordInputs[4].filter(w => w.trim()),
        words_5_letter: wordInputs[5].filter(w => w.trim()),
        words_6_letter: wordInputs[6].filter(w => w.trim()),
        words_7_letter: wordInputs[7].filter(w => w.trim()),
      };

      let error;
      if (editingGame) {
        ({ error } = await mongodb
          .from('word_puzzle')
          .eq('_id', editingGame._id)
          .update(gameData));
      } else {
        ({ error } = await mongodb
          .from('word_puzzle')
          .insert([gameData]));
      }

      if (error) {
        // Handle specific error types
        if (error.code === '23505') {
          if (error.message && error.message.includes('unique_game_date')) {
            toast({
              title: "Date Already Exists",
              description: `A game for the date ${formData.game_date} already exists. Please choose a different date or edit the existing game.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Duplicate Entry",
              description: "This entry already exists in the database.",
              variant: "destructive",
            });
          }
        } else if (error.message && error.message.includes('Duplicate words found')) {
          toast({
            title: "Duplicate Words Error",
            description: "Duplicate words found in the game. Each word must be unique within the game.",
            variant: "destructive",
          });
        } else if (error.message && error.message.includes('7-letter words already exist')) {
          toast({
            title: "7-Letter Words Already Exist",
            description: error.message.replace('ERROR: ', ''),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Database Error",
            description: (error as any).message || "Failed to save the game. Please try again.",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: editingGame ? "Game updated successfully!" : "Game created successfully!",
      });

      if (!editingGame) {
        // Reset form only for new games
        setFormData({
          game_date: new Date().toISOString().split('T')[0],
          center_letter: '',
          surrounding_letters: '',
          words_2_letter: '',
          words_3_letter: '',
          words_4_letter: '',
          words_5_letter: '',
          words_6_letter: '',
          words_7_letter: '',
        });
        setWordInputs({
          2: [''],
          3: [''],
          4: [''],
          5: [''],
          6: [''],
          7: [''],
        });
      }

      if (onGameSaved) {
        onGameSaved();
      }

    } catch (error: any) {
      console.error('Error saving game:', error);
      
      // Handle network or connection errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes('JWT')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please refresh the page and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Error",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{editingGame ? 'Edit Game' : 'Add New Game'}</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Game Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="game_date">Game Date</Label>
                <Input
                  type="date"
                  id="game_date"
                  value={formData.game_date}
                  onChange={(e) => handleInputChange('game_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="center_letter">Center Letter</Label>
                <Input
                  id="center_letter"
                  value={formData.center_letter}
                  onChange={(e) => handleInputChange('center_letter', e.target.value)}
                  style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="surrounding_letters">
                  Surrounding Letters (comma separated)
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    formData.surrounding_letters.split(',').filter(s => s.trim()).length === 6 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.surrounding_letters.split(',').filter(s => s.trim()).length}/6
                  </span>
                </Label>
                <Input
                  id="surrounding_letters"
                  value={formData.surrounding_letters}
                  onChange={(e) => handleInputChange('surrounding_letters', e.target.value)}
                  style={{ 
                    fontFamily: 'Noto Sans Tamil, sans-serif',
                    backgroundColor: formData.surrounding_letters.split(',').filter(s => s.trim()).length === 6 ? '#f0fdf4' : 'white'
                  }}
                  placeholder="க, ல, த, ங, ப, ள"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[7, 6, 5, 4, 3, 2].map(length => (
                <Card key={length} className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-gray-100 dark:bg-gray-800 p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">{length} Letter Words</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addWordInput(length)}
                        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {wordInputs[length].map((word, index) => (
                      <div key={index}>
                        <div className="flex gap-2">
                          <Input
                            value={word}
                            onChange={(e) => updateWordInput(length, index, e.target.value)}
                            style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}
                            placeholder={`${length} letter word`}
                            className={getGraphemeClusters(word).length === length ? 'bg-green-100' : ''}
                          />
                          {wordInputs[length].length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeWordInput(length, index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {wordErrors[length]?.[index] && (
                          <p className="text-red-500 text-xs mt-1">{wordErrors[length]?.[index]}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (editingGame ? 'Updating...' : 'Creating...') : (editingGame ? 'Update Game' : 'Create Game')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddGameForm;
