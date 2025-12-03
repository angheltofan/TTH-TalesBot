import { useState, useEffect } from 'react';
import { GAME_MODES, BASE_INSTRUCTION } from '../constants';
import { GameModeConfig } from '../types';
import { fetchPromptsFromSheet } from '../sheet-utils';

export function useGameConfig() {
  // Pornim cu configurația de fallback (cea din constants.ts)
  const [gameModes, setGameModes] = useState<GameModeConfig[]>(GAME_MODES);
  const [arePromptsLoading, setArePromptsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadPrompts = async () => {
      // Descărcăm doar regulile specifice jocului din Sheet
      const fetchedPrompts = await fetchPromptsFromSheet();
      
      if (mounted) {
        if (fetchedPrompts) {
          setGameModes(prevModes => prevModes.map(mode => {
            const sheetPrompt = fetchedPrompts[mode.id];
            
            // Dacă am găsit un prompt nou în sheet pentru acest mod:
            if (sheetPrompt) {
               return {
                 ...mode,
                 // IMPORTANT: Concatenăm identitatea robotului (BASE) cu noile reguli din Sheet
                 systemInstruction: `${BASE_INSTRUCTION}\n${sheetPrompt}`
               };
            }
            
            // Dacă nu e nimic în sheet, rămânem pe fallback
            return mode;
          }));
        }
        setArePromptsLoading(false);
      }
    };

    loadPrompts();

    return () => { mounted = false; };
  }, []);

  return { gameModes, arePromptsLoading };
}