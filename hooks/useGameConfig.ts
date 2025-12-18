import { useState, useEffect } from "react";
import { BASE_INSTRUCTION } from "../constants";
import { GameModeConfig } from "../types";
import { fetchGameModesFromSheet } from "../sheet-utils";

export function useGameConfig() {
  // Stocăm toate modurile brute din sheet
  const [allModes, setAllModes] = useState<GameModeConfig[]>([]);
  const [arePromptsLoading, setArePromptsLoading] = useState(true);

  const loadGameModes = async () => {
    setArePromptsLoading(true);
    // Încărcăm toate modurile de joc din Google Sheet
    const sheetModes = await fetchGameModesFromSheet();

    if (sheetModes && sheetModes.length > 0) {
      // Construim configurația completă pentru fiecare mod cu valori default
      const configs: GameModeConfig[] = sheetModes.map((mode) => ({
        id: mode.id,
        label: mode.id
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        icon: mode.iconName,
        color: "from-blue-400 to-blue-600", // Culoare default
        description: `Joacă ${mode.id.replace(/_/g, " ")}`,
        // IMPORTANT: Concatenăm identitatea robotului (BASE) cu regulile din Sheet
        systemInstruction: `${BASE_INSTRUCTION}\n${mode.prompt}`,
        voiceName: "Kore", // Vocea standard
      }));

      setAllModes(configs);
      console.log(
        `[useGameConfig] Loaded ${configs.length} game modes from sheet`
      );
    } else {
      console.error("[useGameConfig] No game modes found in sheet!");
      setAllModes([]);
    }
    setArePromptsLoading(false);
  };

  useEffect(() => {
    loadGameModes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    gameModes: allModes,
    arePromptsLoading,
    refreshModes: loadGameModes,
  };
}
