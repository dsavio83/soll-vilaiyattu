import React from 'react';
import { LogOut } from 'lucide-react';

interface UserHeaderProps {
  userName: string;
  userClass: string;
  onLogout: () => void;
  isTestMode?: boolean;
}

const UserHeader = ({ userName, userClass, onLogout, isTestMode = false }: UserHeaderProps) => {
  if (!isTestMode) {
    return null; // Hidden in production mode
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      
    </div>
  );
};

export default UserHeader;