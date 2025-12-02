export enum GameMode {
  MAGIC_JIN = 'magic_jin',
  CULTURA_GENERALA = 'cultura_generala',
  LOGICA_SI_MATEMATICA = 'logica_si_matematica',
  CREATOR_DE_POVESTI = 'creator_de_povesti'
}

// Aoede este vocea selectată ca fiind cea mai bună, dar păstrăm și celelalte în definiție pentru compatibilitate.
export type VoiceName = 'Aoede' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export interface GameModeConfig {
  id: GameMode;
  label: string;
  icon: string; // Lucide icon name
  color: string;
  description: string;
  systemInstruction: string;
  voiceName: VoiceName;
}

export interface AudioState {
  isPlaying: boolean;
  isListening: boolean;
  volume: number; // For visualization
}