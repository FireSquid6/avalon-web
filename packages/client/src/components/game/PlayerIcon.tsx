import React from 'react';

interface PlayerIconProps {
  username: string;
  iconColor: 'white' | 'black' | 'gray';
  assassinated?: boolean;
  nominated?: boolean;
  isMonarch?: boolean;
  hasLady?: boolean;
  isCurrentPlayer?: boolean;
}

export const PlayerIcon: React.FC<PlayerIconProps> = ({
  username,
  iconColor,
  assassinated = false,
  nominated = false,
  hasLady = false,
  isMonarch = false,
  isCurrentPlayer = true,
}) => {
  const getIconColorClass = () => {
    if (assassinated) return 'bg-gray-400';
    
    switch (iconColor) {
      case 'white': return 'bg-white border-gray-300';
      case 'black': return 'bg-black';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTextColorClass = () => {
    return iconColor === 'white' ? 'text-black' : 'text-white';
  };

  return (
    <div className="flex flex-col items-center space-y-2 relative">
      {/* Main circular icon */}
      <div className="relative">
        <div 
          className={`
            w-16 h-16 rounded-full border-2 flex items-center justify-center
            ${isCurrentPlayer ? "border-amber-500" : ""}
            ${getIconColorClass()}
            ${assassinated ? 'opacity-50' : ''}
          `}
        >
          {/* User initial or icon */}
          <span className={`text-xl font-bold ${getTextColorClass()}`}>
            {username.charAt(0).toUpperCase()}
          </span>
          
          {/* Assassination X */}
          {assassinated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">💀</span>
            </div>
          )}
        </div>
        
        {/* Crown for monarch */}
        {isMonarch && !assassinated && (
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <span className="text-2xl">👑</span>
          </div>
        )}
        
        {/* Sword for nomination */}
        {nominated && !assassinated && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
            <span className="text-xl">⚔️</span>
          </div>
        )}

        {/* Lady of the lake */}
        {hasLady && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
            <span className="text-xl">🧚‍♀️</span>
          </div>
        )}
      </div>
      
      {/* Username */}
      <span className={`text-sm font-medium text-gray-100`}>
        {username}
      </span>
    </div>
  );
};
