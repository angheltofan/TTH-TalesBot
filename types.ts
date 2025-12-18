// Nu mai folosim enum fix, ci orice string pentru scalabilitate
export type GameMode = string;

// Aoede este vocea selectată ca fiind cea mai bună, dar păstrăm și celelalte în definiție pentru compatibilitate.
export type VoiceName = "Aoede" | "Puck" | "Charon" | "Kore" | "Fenrir";

export interface GameModeConfig {
  id: GameMode;
  label: string;
  icon: string; // React-icons icon name (ex: AiFillAlipayCircle)
  color: string;
  description: string;
  systemInstruction: string;
  voiceName: VoiceName;
}

// Structura datelor din Google Sheet (doar 3 coloane)
export interface SheetGameMode {
  id: string; // Coloana A - ID-ul jocului
  prompt: string; // Coloana B - Prompt-ul complet
  iconName: string; // Coloana C - Numele iconului din react-icons
}

export interface AudioState {
  isPlaying: boolean;
  isListening: boolean;
  volume: number; // For visualization
}
