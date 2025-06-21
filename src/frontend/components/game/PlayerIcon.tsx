import type { Role } from '@/engine';
import React from 'react';

interface PlayerIconProps {
  username: string;
  iconColor: 'white' | 'black' | 'gray';
  assassinated?: boolean;
  nominated?: boolean;
  isMonarch?: boolean;
  hasLady?: boolean;
  isCurrentPlayer?: boolean;
  role?: Role;
}

function roleToEmoji(role: Role): string {
  switch (role) {
    case "Assassin":
      return "🥷 ";
    case "Merlin":
      return "🧙‍♂️";
    case "Percival":
      return "👦";
    case "Mordredic Servant":
      return "🔴";
    case "Arthurian Servant":
      return "🔵";
    case "Oberon":
      return "🧟";
    case "Mordred":
      return "🧛";
    case "Morgana":
      return "🧝‍♀️";
    case "Lancelot":
      return "💂";
  }
}

export const PlayerIcon: React.FC<PlayerIconProps> = ({
  username,
  iconColor,
  assassinated = false,
  nominated = false,
  hasLady = false,
  isMonarch = false,
  isCurrentPlayer = true,
  role = undefined,
}) => {
  const getIconColorClass = () => {
    if (assassinated) return 'bg-gray-400';

    switch (iconColor) {
      case 'white': return 'bg-white';
      case 'black': return 'bg-black';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTextColorClass = () => {
    return iconColor === 'white' ? 'text-black' : 'text-white';
  };

  let titles: string[] = [];
  let headerString = "";

  if (hasLady) {
    headerString += "🧚‍♀️"
    titles.push("holding the lady of the lake");
  }
  if (isMonarch) {
    headerString += "👑";
    titles.push("the current monarch");
  }
  if (nominated) {
    headerString += "🛡️";
    titles.push("nominated for the quest");
  }
  if (role) {
    headerString += roleToEmoji(role);
    titles.push(`revealed to have the role "${role}"`);
  }

  if (headerString === "") {
    headerString = "-";
  }

  let title = "";
  switch (titles.length) {
    case 0:
      break;
    case 1:
      title = `${username} is ${titles[0]}`;
      break;
    case 2:
      title = `${username} is ${titles[0]} and ${titles[1]}`;
      break;
    default:
      const lastTitle = titles.pop();
      title = `${username} is `;
      for (const t of titles) {
        title += `${t}, `;
      }
      title += `and ${lastTitle}`;
  }

  return (
    <div className="flex flex-col items-center space-y-2 relative">
      {/* Main circular icon */}
      <span className={`text-sm md:text-md mb-0 lg:text-lg font-medium text-gray-100`} title={title}>
        {headerString}
      </span>
      <div className="relative">
        <div
          className={`
            w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center
            ${isCurrentPlayer ? "border-amber-500" : ""}
            ${getIconColorClass()}
            ${assassinated ? 'opacity-50' : ''}
          `}
        >
          {/* User initial or icon */}
          <span className={`text-md md:text-lg lg:text-xl font-bold ${getTextColorClass()}`}>
            {username.charAt(0).toUpperCase()}
          </span>

          {/* Assassination X */}
          {assassinated && (
            <div className="absolute inset-0 flex items-center justify-center" title="This player has been assassinated">
              <span className="text-2xl">💀</span>
            </div>
          )}
        </div>

      </div>
      {/* Username */}
      <span className={`text-sm font-medium text-gray-100`}>
        {username}
      </span>

    </div>
  );
};
