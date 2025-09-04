
import React from 'react';
import { RotateCcw, Delete, Plus } from 'lucide-react';

interface GameControlsProps {
  onDelete: () => void;
  onShuffle: () => void;
  onEnter: () => void;
  canEnter: boolean;
  disabled?: boolean;
}

const GameControls = ({ onDelete, onShuffle, onEnter, canEnter, disabled = false }: GameControlsProps) => {
  return (
    <div className="flex justify-center gap-2 px-4 w-full max-w-lg mx-auto">
      <button
        onClick={onDelete}
        disabled={disabled}
        className={`flex-1 px-2 py-3 rounded-full font-medium transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-1 min-h-[48px] ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-xl'
        }`}
        title="Delete last letter"
      >
        <Delete className="w-4 h-4" />
        <span className="text-xs font-bold">Delete</span>
      </button>
      
      <button
        onClick={onShuffle}
        disabled={disabled}
        className={`flex-1 px-2 py-3 rounded-full transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-1 min-h-[48px] ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600 text-white hover:shadow-xl'
        }`}
        title="Shuffle surrounding letters"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-xs font-bold">Shuffle</span>
      </button>
      
      <button
        onClick={onEnter}
        disabled={!canEnter || disabled}
        className={`flex-1 px-2 py-3 rounded-full font-bold text-base transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-1 min-h-[48px] ${
          canEnter && !disabled
            ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title="Submit word"
      >
        <Plus className="w-4 h-4" />
        <span className="text-xs font-bold">Add</span>
      </button>
    </div>
  );
};

export default GameControls;
