import React from 'react';
import { PlayerIcon } from './PlayerIcon';
import type { Role } from 'engine';

export interface Player {
  id: string;
  username: string;
  iconColor: 'white' | 'black' | 'gray';
  assassinated?: boolean;
  nominated?: boolean;
  isMonarch?: boolean;
  isCurrentPlayer?: boolean;
  hasLady?: boolean;
  role?: Role
}

interface PlayerCircleProps {
  players: Player[];
  radius?: number;
  centerText?: string;
}

export const PlayerCircle: React.FC<PlayerCircleProps> = ({
  players,
  radius = 150,
  centerText,
}) => {
  const calculatePosition = (index: number, total: number) => {
    // Start from top (12 o'clock) and go clockwise
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)',
    };
  };

  const containerSize = (radius + 50) * 2; // Add padding for player icons

  return (
    <div 
      className="relative mx-auto"
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
      }}
    >
      {players.map((player, index) => (
        <div
          key={player.id}
          className="absolute"
          style={calculatePosition(index, players.length)}
        >
          <PlayerIcon
            username={player.username}
            role={player.role}
            iconColor={player.iconColor}
            assassinated={player.assassinated}
            nominated={player.nominated}
            isMonarch={player.isMonarch}
            isCurrentPlayer={player.isCurrentPlayer}
            hasLady={player.hasLady}
          />
        </div>
      ))}
      
      {/* Center text */}
      {centerText && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-center text-white font-semibold text-lg">
            {centerText}
          </div>
        </div>
      )}
    </div>
  );
};
