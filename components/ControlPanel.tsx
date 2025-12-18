import React from "react";
import {
  Loader2,
  Square,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import GameButton from "./GameButton";
import { GameMode, GameModeConfig } from "../types";

interface ControlPanelProps {
  isConnected: boolean;
  isConnecting: boolean;
  arePromptsLoading: boolean;
  currentMode: GameMode;
  gameModes: GameModeConfig[];
  onToggleSession: () => void;
  onModeChange: (id: GameMode) => void;
  onRefreshModes: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isConnected,
  isConnecting,
  arePromptsLoading,
  currentMode,
  gameModes,
  onToggleSession,
  onModeChange,
  onRefreshModes,
}) => {
  return (
    <div className="flex flex-col items-center justify-end landscape:justify-center w-full landscape:w-1/2 landscape:h-full pb-8 landscape:pb-0 landscape:pl-8 relative">
      <div className="hidden landscape:block text-center mb-8">
        <h1 className="text-5xl font-normal tracking-tight drop-shadow-md mb-2 text-white">
          TTH - Tale Bot
        </h1>
        <p className="text-lg font-normal text-cyan-50 opacity-90">
          Asistentul de joaca al Tales&Tech
        </p>
      </div>

      <button
        onClick={onToggleSession}
        disabled={isConnecting || arePromptsLoading}
        className={`
                group relative w-full max-w-[280px] h-14 rounded-full shadow-lg
                flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 mb-8
                overflow-hidden shrink-0 border border-white/40 backdrop-blur-sm
                ${
                  isConnecting || arePromptsLoading
                    ? "bg-slate-200 text-slate-400 border-transparent cursor-not-allowed"
                    : isConnected
                    ? "bg-gradient-to-r from-red-500 to-pink-600"
                    : "bg-white text-[#00AEEF]"
                }
            `}
      >
        {arePromptsLoading ? (
          <>
            <Loader2 size={20} className="animate-spin text-slate-500" />
            <span className="text-sm font-normal uppercase tracking-widest text-slate-500">
              Se încarcă...
            </span>
          </>
        ) : isConnecting ? (
          <>
            <Loader2 size={20} className="animate-spin text-slate-500" />
            <span className="text-sm font-normal uppercase tracking-widest text-slate-500">
              Se conectează...
            </span>
          </>
        ) : isConnected ? (
          <>
            <Square size={20} fill="currentColor" className="text-white" />
            <span className="text-sm font-normal uppercase tracking-widest text-white">
              Stop Joc
            </span>
          </>
        ) : (
          <>
            <Sparkles size={20} className="text-[#00AEEF] animate-pulse" />
            <span className="text-sm font-normal uppercase tracking-widest text-[#00AEEF]">
              Începe Jocul
            </span>
          </>
        )}
      </button>

      {/* Mode Selection Dock */}
      <div className="w-full max-w-[400px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-[24px] p-4 shadow-2xl flex flex-col gap-3 max-h-[40vh] landscape:max-h-[60vh] transition-all duration-500 relative">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between px-2 shrink-0 relative z-20">
          <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
            Selectează Modul ({gameModes.length})
          </span>

          <button
            onClick={onRefreshModes}
            disabled={arePromptsLoading}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white disabled:opacity-50"
            title="Reîncarcă modurile din Sheet"
          >
            <RefreshCw size={16} className={arePromptsLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Grid of Modes */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto pr-1 min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent p-1">
          {gameModes.map((mode) => (
            <div key={mode.id} className="relative group">
              <GameButton
                mode={mode}
                isActive={currentMode === mode.id}
                onClick={() => onModeChange(mode.id)}
                disabled={isConnecting || arePromptsLoading}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ControlPanel;
