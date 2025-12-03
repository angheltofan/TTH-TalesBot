import React from 'react';
import { Brain, Calculator, BookOpen } from 'lucide-react';
import { GiMagicLamp } from 'react-icons/gi';
import { GameMode, GameModeConfig } from '../types';

interface GameButtonProps {
  mode: GameModeConfig;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const GameButton: React.FC<GameButtonProps> = ({ mode, isActive, onClick, disabled }) => {
  const Icon = {
    [GameMode.MAGIC_JIN]: GiMagicLamp,
    [GameMode.CULTURA_GENERALA]: Brain,
    [GameMode.LOGICA_SI_MATEMATICA]: Calculator,
    [GameMode.CREATOR_DE_POVESTI]: BookOpen,
  }[mode.id];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all duration-300 flex-1 min-w-0 h-full
        ${isActive 
          ? 'bg-white text-[#00AEEF] shadow-md scale-105 ring-2 ring-cyan-200 -translate-y-1 z-10' 
          : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white border border-white/10'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className={`p-1.5 rounded-full mb-1 transition-colors shrink-0 ${isActive ? 'bg-cyan-50' : 'bg-white/10'}`}>
        <Icon size={16} className="landscape:w-5 landscape:h-5" strokeWidth={isActive ? 2 : 1.5} />
      </div>
      <div className="flex items-center justify-center w-full px-0.5 grow">
        <span className="text-[8px] landscape:text-[9px] font-normal text-center leading-tight uppercase tracking-normal w-full break-normal">
          {mode.label}
        </span>
      </div>
    </button>
  );
};

export default GameButton;