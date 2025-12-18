import React from "react";
import { GameModeConfig } from "../types";
import GameIconRenderer from "./GameIconRenderer";

interface GameButtonProps {
  mode: GameModeConfig;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const GameButton: React.FC<GameButtonProps> = ({
  mode,
  isActive,
  onClick,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full aspect-square
        ${
          isActive
            ? "bg-white text-[#00AEEF] shadow-md scale-105 ring-2 ring-cyan-200 z-10"
            : "bg-white/10 text-white/90 hover:bg-white/20 hover:text-white border border-white/10"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div
        className={`p-2 rounded-full mb-2 transition-colors shrink-0 ${
          isActive ? "bg-cyan-50" : "bg-white/10"
        }`}
      >
        <GameIconRenderer
          iconName={mode.icon}
          size={20}
          className="landscape:w-6 landscape:h-6"
        />
      </div>
      <div className="flex items-center justify-center w-full px-1 grow-0">
        <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-wide w-full break-words line-clamp-2">
          {mode.label}
        </span>
      </div>
    </button>
  );
};

export default GameButton;
