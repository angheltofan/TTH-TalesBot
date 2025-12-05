import React, { useState, useEffect } from 'react';
import { GameMode } from './types';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useGameConfig } from './hooks/useGameConfig';
import { fetchApiKeyFromSheet } from './sheet-utils';

import RobotAvatar from './components/RobotAvatar';
import ControlPanel from './components/ControlPanel';

export default function App() {
  // State for current selection
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.MAGIC_JIN);
  
  // State for API Key (loads from Sheet or falls back to Env)
  const [dynamicApiKey, setDynamicApiKey] = useState<string | undefined>(process.env.API_KEY);
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
    return () => { mounted = false; };
  }, []);

  // Custom Hooks
  const { gameModes, arePromptsLoading } = useGameConfig();
  const { 
    isConnected, 
    isConnecting, 
    audioVolume, 
    error, 
    startSession, 
    stopSession 
  } = useGeminiLive(dynamicApiKey);

  // Handlers
  const handleToggleSession = () => {
    if (isConnected) {
      stopSession();
    } else {
      const modeConfig = gameModes.find(m => m.id === currentMode);
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
        />

      </div>
    </div>
  );
}