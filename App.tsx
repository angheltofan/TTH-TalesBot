import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Brain, Calculator, BookOpen, Square, Sparkles, Volume2, Loader2 } from 'lucide-react';
import { GiMagicLamp } from 'react-icons/gi';
import { GAME_MODES } from './constants';
import { GameMode, GameModeConfig } from './types';
import { createBlob, decode, decodeAudioData } from './audio-utils';

// --- Embedded Fallback Image (Robot SVG) ---
// Se afișează dacă tales_tech_logo.png nu este găsită
const ROBOT_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ffffff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e0f7fa;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='100' cy='100' r='90' fill='url(%23grad1)' stroke='%2300AEEF' stroke-width='4'/%3E%3Crect x='55' y='60' width='90' height='70' rx='15' ry='15' fill='%2300AEEF' /%3E%3Ccircle cx='80' cy='90' r='8' fill='white'/%3E%3Ccircle cx='120' cy='90' r='8' fill='white'/%3E%3Cpath d='M85,110 Q100,120 115,110' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Cline x1='100' y1='60' x2='100' y2='30' stroke='%2300AEEF' stroke-width='6'/%3E%3Ccircle cx='100' cy='25' r='8' fill='%23fbbf24'/%3E%3Ctext x='100' y='160' font-family='sans-serif' font-size='18' text-anchor='middle' fill='%2300AEEF' font-weight='normal'%3ETTH%3C/text%3E%3C/svg%3E`;

// --- Components ---

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

// Componenta AudioVisualizer actualizată
// Folosește clase CSS pentru animație continuă și este poziționată mai aproape de logo
const AudioVisualizer = ({ volume, isConnected }: { volume: number, isConnected: boolean }) => {
  const bars = [0, 1, 2];
  // Considerăm activ dacă volumul este peste prag (sau setat manual la 0.5 de AI)
  const isActive = isConnected && volume > 0.01;
  
  // Clase de animație diferite pentru variație
  const animClasses = ['animate-wave', 'animate-wave-fast', 'animate-wave-delayed'];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      {/* Left Side Bars - Moved closer with mr-2 (instead of mr-5) */}
      <div className="absolute right-full mr-2 flex items-center gap-1.5 h-24">
        {bars.map((i) => (
            <div 
              key={`l-${i}`}
              className={`w-1.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] ${isActive ? animClasses[i % 3] : ''}`}
              style={{
                height: isActive ? '20px' : '6px', // CSS animation overrides this height when active
                opacity: isConnected ? 0.9 - (i * 0.15) : 0,
                transition: 'opacity 0.3s ease, height 0.3s ease'
              }}
            />
        ))}
      </div>

      {/* Right Side Bars - Moved closer with ml-2 (instead of ml-5) */}
      <div className="absolute left-full ml-2 flex items-center gap-1.5 h-24">
        {bars.map((i) => (
            <div 
              key={`r-${i}`}
              className={`w-1.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] ${isActive ? animClasses[i % 3] : ''}`}
              style={{
                height: isActive ? '20px' : '6px', 
                opacity: isConnected ? 0.9 - (i * 0.15) : 0,
                transition: 'opacity 0.3s ease, height 0.3s ease'
              }}
            />
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.MAGIC_JIN);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Image handling state
  const [imgSrc, setImgSrc] = useState("tales_tech_logo.png");

  // Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); 
  const aiRef = useRef<GoogleGenAI | null>(null);
  const wakeLockRef = useRef<any>(null); // Ref for Wake Lock Sentinel
  
  // Track active audio sources to handle interruptions
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  // Ref for debounce timeout
  const volumeResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to request Wake Lock
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock active');
        // Re-request if released by system (e.g. visibility change)
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock released');
          wakeLockRef.current = null;
        });
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
  };

  // Handle visibility change to re-acquire wake lock if necessary when connected
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isConnected) {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected]);

  useEffect(() => {
    if (process.env.API_KEY) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      setError("API Key missing");
    }
    return () => { stopSession(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    if (!aiRef.current || isConnecting || isConnected) return;
    setError(null);
    setIsConnecting(true);

    try {
      // 1. Request Wake Lock immediately
      await requestWakeLock();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputContextRef.current = inputContext;

      const outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputContextRef.current = outputContext;

      const modeConfig = GAME_MODES.find(m => m.id === currentMode)!;

      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Connection opened");
            setIsConnected(true);
            setIsConnecting(false);
            const source = inputContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            const processor = inputContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              
              // Dacă AI-ul nu vorbește (nu avem surse active), folosim volumul microfonului
              if (audioSourcesRef.current.size === 0) {
                 setAudioVolume(rms > 0.02 ? rms * 5 : 0);
              }
              
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(processor);
            processor.connect(inputContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Playback
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               // Clear any pending volume reset
               if (volumeResetTimeoutRef.current) {
                 clearTimeout(volumeResetTimeoutRef.current);
                 volumeResetTimeoutRef.current = null;
               }

               // Force volume high for visualizer while AI speaks
               setAudioVolume(0.5); 
               
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
               
               const audioBuffer = await decodeAudioData(decode(base64Audio), outputContext, 24000, 1);
               const source = outputContext.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputContext.destination);
               
               // Register source for cancellation
               audioSourcesRef.current.add(source);
               
               source.onended = () => {
                   audioSourcesRef.current.delete(source);
                   
                   // Dacă nu mai sunt surse, așteptăm puțin înainte de a opri animația
                   // pentru a acoperi pauzele mici dintre pachetele audio
                   if (audioSourcesRef.current.size === 0) {
                       if (volumeResetTimeoutRef.current) clearTimeout(volumeResetTimeoutRef.current);
                       
                       volumeResetTimeoutRef.current = setTimeout(() => {
                           // Check again in case a new chunk started
                           if (audioSourcesRef.current.size === 0) {
                               setAudioVolume(0);
                           }
                       }, 400); // 400ms buffer
                   }
               };

               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
            }

            // Handle Interruption (Stop all current audio)
            if (message.serverContent?.interrupted) {
               console.log("Interrupted - stopping current audio");
               if (volumeResetTimeoutRef.current) clearTimeout(volumeResetTimeoutRef.current);
               
               audioSourcesRef.current.forEach(src => {
                   try { src.stop(); } catch (e) { /* ignore already stopped */ }
               });
               audioSourcesRef.current.clear();
               setAudioVolume(0); // Reset volume visuals immediately
               nextStartTimeRef.current = outputContext.currentTime;
            }
          },
          onclose: () => { 
            setIsConnected(false); 
            setIsConnecting(false);
            console.log("Connection closed");
          },
          onerror: (err) => {
            console.error(err);
            // Do not alert explicitly for normal closures, but reset state
            setError("Conexiune întreruptă. Reîncearcă.");
            stopSession();
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: modeConfig.voiceName // Use specific voice
              } 
            } 
          },
          systemInstruction: modeConfig.systemInstruction
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Acces microfon refuzat sau eroare.");
      stopSession();
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (volumeResetTimeoutRef.current) clearTimeout(volumeResetTimeoutRef.current);
    
    // Release Wake Lock
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
        .then(() => { wakeLockRef.current = null; })
        .catch((e: any) => console.log(e));
    }

    // Stop all active audio buffers immediately
    audioSourcesRef.current.forEach(src => {
        try { src.stop(); } catch (e) {}
    });
    audioSourcesRef.current.clear();

    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current.onaudioprocess = null; processorRef.current = null; }
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    if (inputContextRef.current) { inputContextRef.current.close(); inputContextRef.current = null; }
    if (outputContextRef.current) { outputContextRef.current.close(); outputContextRef.current = null; }
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    
    setIsConnected(false);
    setIsConnecting(false);
    setAudioVolume(0);
    nextStartTimeRef.current = 0;
  };

  const handleModeChange = (newMode: GameMode) => {
    if (isConnecting) return;
    if (isConnected) stopSession();
    setCurrentMode(newMode);
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#00AEEF] text-white font-['Nunito'] select-none">
      
      {/* Background Gradient - Vertical bottom-to-top blue */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#01579b] to-[#00AEEF]" />
      
      {/* Main Layout */}
      <div className="relative z-10 w-full h-full flex flex-col landscape:flex-row p-4 landscape:p-6 gap-4 box-border max-w-7xl mx-auto">
        
        {/* --- LEFT SIDE: Robot Visuals --- */}
        <div className="flex-1 flex flex-col items-center justify-center relative landscape:w-1/2 landscape:h-full py-4">
            
            {/* Header (Mobile) */}
            <div className="text-center mb-6 landscape:hidden animate-fade-in-down">
                <h1 className="text-3xl font-normal tracking-tight drop-shadow-sm text-white">TTH - Tale Bot</h1>
                <p className="text-sm font-normal text-cyan-50 mt-1 opacity-90">Asistentul de joacă al Tales&Tech</p>
            </div>

            {/* Robot Container */}
            <div className="relative flex items-center justify-center w-full max-w-[280px] aspect-square">
                {/* Aura Effects */}
                <div className={`absolute inset-0 bg-cyan-200/30 rounded-full blur-[60px] transition-all duration-700 ${isConnected ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`}></div>
                
                {/* Visualizer Lines - Updated */}
                <AudioVisualizer volume={audioVolume} isConnected={isConnected} />

                {/* Main Logo Image with Fallback Logic */}
                <img 
                    src={imgSrc}
                    alt="TTH Robot" 
                    className={`
                        relative z-10 w-full h-full object-contain drop-shadow-2xl 
                        transition-transform duration-300 ease-out
                        ${isConnected ? 'animate-float' : ''}
                    `}
                    style={{ 
                        transform: isConnected ? `scale(${1 + Math.min(audioVolume * 0.5, 0.2)})` : 'scale(1)',
                    }}
                    onError={() => {
                       console.warn("Logo PNG not found, using SVG fallback.");
                       setImgSrc(ROBOT_PLACEHOLDER);
                    }}
                />
                
                {/* Status Badge */}
                {isConnected && (
                    <div className="absolute -bottom-6 bg-white/95 text-[#00AEEF] px-5 py-2 rounded-full font-normal text-[11px] uppercase tracking-widest shadow-xl animate-fade-in-up z-20 flex items-center gap-2">
                        <Volume2 size={14} className="animate-pulse" />
                        Ascult...
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="absolute top-4 bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-normal shadow-lg animate-bounce z-50 text-center max-w-[90%]">
                    {error}
                </div>
            )}
        </div>

        {/* --- RIGHT SIDE: Controls --- */}
        <div className="flex flex-col items-center justify-end landscape:justify-center w-full landscape:w-1/2 landscape:h-full pb-8 landscape:pb-0 landscape:pl-8">
            
            {/* Header (Landscape) */}
            <div className="hidden landscape:block text-center mb-8">
                <h1 className="text-5xl font-normal tracking-tight drop-shadow-md mb-2 text-white">
                   TTH - Tale Bot
                </h1>
                <p className="text-lg font-normal text-cyan-50 opacity-90">Asistentul de joaca al Tales&Tech</p>
            </div>

            {/* Main Action Button */}
            <button
                onClick={isConnected ? stopSession : startSession}
                disabled={isConnecting}
                className={`
                    group relative w-full max-w-[280px] h-14 rounded-full shadow-lg
                    flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 mb-8
                    overflow-hidden shrink-0 border border-white/40 backdrop-blur-sm
                    ${isConnecting 
                      ? 'bg-slate-200 text-slate-400 border-transparent cursor-not-allowed'
                      : isConnected 
                        ? 'bg-gradient-to-r from-red-500 to-pink-600' 
                        : 'bg-white text-[#00AEEF]'
                    }
                `}
            >
                {isConnecting ? (
                   <>
                       <Loader2 size={20} className="animate-spin text-slate-500" />
                       <span className="text-sm font-normal uppercase tracking-widest text-slate-500">Se conectează...</span>
                   </>
                ) : isConnected ? (
                    <>
                        <Square size={20} fill="currentColor" className="text-white" />
                        <span className="text-sm font-normal uppercase tracking-widest text-white">Stop Joc</span>
                    </>
                ) : (
                    <>
                        <Sparkles size={20} className="text-[#00AEEF] animate-pulse" />
                        <span className="text-sm font-normal uppercase tracking-widest text-[#00AEEF]">Începe Jocul</span>
                    </>
                )}
            </button>

            {/* Mode Selection Dock */}
            <div className="w-full max-w-[400px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-[24px] p-3 shadow-2xl">
                <div className="flex items-center justify-between mb-2 px-2">
                     <span className="text-[9px] font-normal text-white/80 uppercase tracking-[0.2em]">Selectează Modul</span>
                     <div className="flex items-center gap-1 opacity-60">
                        <div className="w-1 h-1 rounded-full bg-white"></div>
                        <div className="w-1 h-1 rounded-full bg-white"></div>
                        <div className="w-1 h-1 rounded-full bg-white"></div>
                     </div>
                </div>
                
                <div className="flex justify-between items-stretch gap-0.5 h-[80px]">
                    {GAME_MODES.map((mode) => (
                        <GameButton
                            key={mode.id}
                            mode={mode}
                            isActive={currentMode === mode.id}
                            onClick={() => handleModeChange(mode.id)}
                            disabled={isConnecting}
                        />
                    ))}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}