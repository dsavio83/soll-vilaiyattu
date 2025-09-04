
import React, { useState, useEffect } from 'react';
import { mongodb } from '@/integrations/mongodb/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Trash2, Edit, Download, Upload } from 'lucide-react';
import { getGraphemeClusters } from '@/utils/tamilUtils';
import { useToast } from '@/hooks/use-toast';
import WordsModal from './WordsModal';

interface WordPuzzle {
  id: string;
  _id: string; // Add _id for direct MongoDB querying
  game_date: string;
  center_letter: string;
  surrounding_letters: string[];
  words_2_letter: string[];
  words_3_letter: string[];
  words_4_letter: string[];
  words_5_letter: string[];
  words_6_letter: string[];
  words_7_letter: string[];
}

interface GameManagementProps {
  onEditGame?: (game: WordPuzzle) => void;
}

const GameManagement = ({ onEditGame }: GameManagementProps) => {
  const [games, setGames] = useState<WordPuzzle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWordsModal, setShowWordsModal] = useState(false);
  const [selectedGameWords, setSelectedGameWords] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await mongodb
        .from('word_puzzle')
        .select('*')
        .order('game_date', { ascending: false });

      if (error) {
        console.error('Error loading games:', error);
      } else {
        setGames(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await mongodb
        .from('word_puzzle')
        .eq('id', id)
        .delete();

      if (error) {
        console.error('Error deleting game:', error);
        toast({
          title: "Error",
          description: "Failed to delete game.",
          variant: "destructive",
        });
      } else {
        setGames(games.filter(game => game.id !== id));
        toast({
          title: "Success",
          description: "Game deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (game: WordPuzzle) => {
    if (onEditGame) {
      onEditGame(game);
    }
  };

  const handleViewWords = (game: WordPuzzle) => {
    const allWords = [
      ...(game.words_2_letter || []),
      ...(game.words_3_letter || []),
      ...(game.words_4_letter || []),
      ...(game.words_5_letter || []),
      ...(game.words_6_letter || []),
      ...(game.words_7_letter || [])
    ].filter(word => word && word.trim());
    
    const uniqueWords = [...new Set(allWords)];
    setSelectedGameWords(uniqueWords);
    setShowWordsModal(true);
  };

  const handleExportAllGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await mongodb
        .from('word_puzzle')
        .select('*')
        .order('game_date', { ascending: false });

      if (error) {
        console.error('Error exporting games:', error);
        toast({
          title: "Export Failed",
          description: "Failed to fetch games for export.",
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "No Games to Export",
          description: "There are no games in the database to export.",
          variant: "default",
        });
        return;
      }

      const jsonContent = JSON.stringify(data, null, 2); // Pretty print JSON
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `all_games_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: "Export Successful",
        description: `${data.length} games exported successfully.`, 
      });

    } catch (error) {
      console.error('Error during export:', error);
      toast({
        title: "Export Failed",
        description: `An unexpected error occurred during export: ${error.message || 'Unknown error'}`, 
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportAllGames = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const importedGames: WordPuzzle[] = JSON.parse(content);

        if (!Array.isArray(importedGames) || importedGames.length === 0) {
          toast({
            title: "Import Failed",
            description: "Invalid JSON format or empty file. Expected an array of game objects.",
            variant: "destructive",
          });
          return;
        }

        setLoading(true);
        let successCount = 0;
        let failCount = 0;
        let errors: string[] = [];

        for (const game of importedGames) {
          // Construct the query for upsert
          let queryForUpsert: any = {};
          if (game._id) {
            queryForUpsert._id = game._id;
          } else if (game.game_date) {
            queryForUpsert.game_date = game.game_date;
          } else {
            failCount++;
            errors.push(`Game: Missing _id or game_date for upsert.`);
            continue; // Skip this game if no identifier
          }
          
          // Remove _id from data if it exists, as MongoDB will generate it or use existing
          const gameDataToUpsert = { ...game };
          delete gameDataToUpsert._id; 

          try {
            const { error } = await mongodb.from('word_puzzle').eq(Object.keys(queryForUpsert)[0], Object.values(queryForUpsert)[0]).upsert(gameDataToUpsert);
            if (error) {
              failCount++;
              errors.push(`Game ${game.game_date || game._id}: ${error.message || 'Unknown error'}`);
              console.error(`Error upserting game ${game.game_date || game._id}:`, error);
            } else {
              successCount++;
            }
          } catch (e: any) {
            failCount++;
            errors.push(`Game ${game.game_date || game._id}: ${e.message || 'Unexpected error'}`);
            console.error(`Unexpected error during upsert for game ${game.game_date || game._id}:`, e);
          }
        }

        if (successCount > 0) {
          toast({
            title: "Import Completed",
            description: `${successCount} games imported/updated successfully. ${failCount} failed.`, 
            variant: failCount > 0 ? "warning" : "success",
          });
          loadGames(); // Reload games list
        } else {
          toast({
            title: "Import Failed",
            description: `No games were imported. ${failCount} failed.`, 
            variant: "destructive",
          });
        }

        if (errors.length > 0) {
          console.error("Import errors:", errors.join('\n'));
        }

      } catch (error: any) {
        toast({
          title: "Import Failed",
          description: `Error parsing JSON file: ${error.message || 'Invalid JSON format'}`, 
          variant: "destructive",
        });
        console.error('Error parsing import JSON:', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Clear file input
  };

  return (
    <Card className="shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4 border-b flex justify-between items-center">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Games List</CardTitle>
        <div className="flex items-center gap-2"> {/* New div for buttons */}
          <Button variant="outline" size="sm" onClick={handleExportAllGames} className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Export All Games
          </Button>
          {/* New Import Button and File Input */}
          <input
            type="file"
            id="import-all-games-file"
            accept=".json"
            style={{ display: 'none' }} // Hide the actual input
            onChange={handleImportAllGames} // This will be the handler
          />
          <Button variant="outline" size="sm" onClick={() => document.getElementById('import-all-games-file')?.click()} className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Import All Games
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Center Letter</th>
                <th scope="col" className="px-6 py-3">Surrounding Letters</th>
                <th scope="col" className="px-6 py-3">7-Letter Word</th>
                <th scope="col" className="px-6 py-3">Total Words</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={`${game.id}-${game.game_date}`} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {new Date(game.game_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {game.center_letter}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {game.surrounding_letters.join(', ')}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {game.words_7_letter?.join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    {[
                      ...(game.words_2_letter || []),
                      ...(game.words_3_letter || []),
                      ...(game.words_4_letter || []),
                      ...(game.words_5_letter || []),
                      ...(game.words_6_letter || []),
                      ...(game.words_7_letter || [])
                    ].length}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => handleViewWords(game)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(game)} className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(game.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <WordsModal
        isOpen={showWordsModal}
        onClose={() => setShowWordsModal(false)}
        foundWords={selectedGameWords}
        allValidWords={selectedGameWords}
        totalWords={selectedGameWords.length}
      />
    </Card>
  );
};

export default GameManagement;
