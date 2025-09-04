
import React, { useState } from 'react';
import { Plus, Users, BookOpen, Trophy, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import GameManagement from '../components/GameManagement';
import StudentsManagement from '../components/StudentsManagement';
import LeaderboardModal from '../components/LeaderboardModal';
import AddGameForm from '../components/AddGameForm';
import AdsManagement from '../components/AdsManagement';
import GoogleAds from '../components/GoogleAds';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState('add-game');
  const [editingGame, setEditingGame] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleEditGame = (game: any) => {
    setEditingGame(game);
    setActiveTab('add-game');
  };

  const handleGameSaved = () => {
    setEditingGame(null);
    setActiveTab('games-list');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white whitespace-nowrap">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'add-game') {
            setEditingGame(null);
          }
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <TabsTrigger value="add-game" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Plus className="w-5 h-5" />
              <span>Add Words</span>
            </TabsTrigger>
            <TabsTrigger value="games-list" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <BookOpen className="w-5 h-5" />
              <span>Word List</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Users className="w-5 h-5" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Settings className="w-5 h-5" />
              <span>Ads</span>
            </TabsTrigger>
          </TabsList>

          <Card className="shadow-xl rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <TabsContent value="add-game">
                <AddGameForm 
                  editingGame={editingGame} 
                  onGameSaved={handleGameSaved}
                />
              </TabsContent>

              <TabsContent value="games-list">
                <GameManagement onEditGame={handleEditGame} />
              </TabsContent>

              <TabsContent value="students">
                <StudentsManagement />
              </TabsContent>

              <TabsContent value="ads">
                <AdsManagement />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        {/* Admin Dashboard Banner Ad */}
        <div className="mt-8">
          <GoogleAds 
            adSlot="6833809490"
            adFormat="fluid"
            adLayoutKey="-fd+b+v-54+5s"
            style={{ minHeight: '100px' }}
            className="rounded-lg overflow-hidden shadow-lg"
          />
        </div>

        <LeaderboardModal 
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          currentUserId={undefined}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
