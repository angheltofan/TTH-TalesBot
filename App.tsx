import React, { useState, useEffect } from "react";
import { GameMode } from "./types";
import { useGeminiLive } from "./hooks/useGeminiLive";
import { useGameConfig } from "./hooks/useGameConfig";
import { fetchApiKeyFromSheet } from "./sheet-utils";

import RobotAvatar from "./components/RobotAvatar";
import ControlPanel from "./components/ControlPanel";

export default function App() {
  // State for current selection (începe gol, va fi setat când se încarcă modurile)
  const [currentMode, setCurrentMode] = useState<GameMode>("");

  // State for API Key (loads from Sheet or falls back to Env)
  const [dynamicApiKey, setDynamicApiKey] = useState<string | undefined>(
    // Use import.meta.env for Vite, or leave undefined for browser fallback
    (import.meta as any).env?.VITE_API_KEY
  );
  const [isKeyLoading, setIsKeyLoading] = useState(true);

  // Load API Key on Mount
  useEffect(() => {
    let mounted = true;
    const loadKey = async () => {
      const sheetKey = await fetchApiKeyFromSheet();
      if (mounted) {
        if (sheetKey) {
          setDynamicApiKey(sheetKey);
        }
        setIsKeyLoading(false);
      }
    };
    loadKey();
    return () => {
      mounted = false;
    };
  }, []);

  // Custom Hooks
  const {
    gameModes,
    arePromptsLoading,
    refreshModes,
  } = useGameConfig();

  // Setăm primul mod ca default când se încarcă modurile
  useEffect(() => {
    if (gameModes.length > 0 && !currentMode) {
      setCurrentMode(gameModes[0].id);
    }
  }, [gameModes, currentMode]);

  const {
    isConnected,
    isConnecting,
    audioVolume,
    error,
    startSession,
    stopSession,
  } = useGeminiLive(dynamicApiKey);

  // Handlers
  const handleToggleSession = () => {
    if (isConnected) {
      stopSession();
    } else {
      const modeConfig = gameModes.find((m) => m.id === currentMode);
      if (modeConfig) {
        startSession(modeConfig);
      }
    }
  };

  const handleModeChange = (newMode: GameMode) => {
    if (isConnecting) return;
    if (isConnected) stopSession();
    setCurrentMode(newMode);
  };

  const isLoading = arePromptsLoading || isKeyLoading;

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#00AEEF] text-white font-['Nunito'] select-none">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#01579b] to-[#00AEEF]" />

      <div className="relative z-10 w-full h-full flex flex-col landscape:flex-row p-4 landscape:p-6 gap-4 box-border max-w-7xl mx-auto">
        {/* Left: Avatar & Visuals */}
        <RobotAvatar
          isConnected={isConnected}
          audioVolume={audioVolume}
          arePromptsLoading={isLoading}
          error={error}
        />

        {/* Right: Controls & Navigation */}
        <ControlPanel
          isConnected={isConnected}
          isConnecting={isConnecting}
          arePromptsLoading={isLoading}
          currentMode={currentMode}
          gameModes={gameModes}
          onToggleSession={handleToggleSession}
          onModeChange={handleModeChange}
          onRefreshModes={refreshModes}
        />
      </div>
    </div>
  );
}
