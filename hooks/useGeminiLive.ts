import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../audio-utils';
import { GameModeConfig } from '../types';
import { useWakeLock } from './useWakeLock';

export function useGeminiLive(apiKey: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Audio Context Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Logic Refs
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); 
  const aiRef = useRef<GoogleGenAI | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const volumeResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionCleanupRef = useRef<boolean>(false);

  // Initialize AI Client
  useEffect(() => {
    if (apiKey) {
      aiRef.current = new GoogleGenAI({ apiKey });
    } else {
      setError("API Key missing");
    }
  }, [apiKey]);

  // Handle Wake Lock
  useWakeLock(isConnected);

  const stopSession = useCallback(() => {
    connectionCleanupRef.current = true;
    
    // Clear timeouts
    if (volumeResetTimeoutRef.current) {
        clearTimeout(volumeResetTimeoutRef.current);
        volumeResetTimeoutRef.current = null;
    }

    // Stop all playing audio
    audioSourcesRef.current.forEach(src => {
        try { src.stop(); } catch (e) {}
    });
    audioSourcesRef.current.clear();

    // Disconnect Nodes safely
    if (processorRef.current) { 
        try {
            processorRef.current.disconnect(); 
            processorRef.current.onaudioprocess = null; 
        } catch (e) {}
        processorRef.current = null; 
    }
    if (sourceRef.current) { 
        try {
            sourceRef.current.disconnect(); 
        } catch (e) {}
        sourceRef.current = null; 
    }
    
    // Stop Media Stream Tracks
    if (streamRef.current) { 
        try {
            streamRef.current.getTracks().forEach(track => track.stop()); 
        } catch (e) {}
        streamRef.current = null; 
    }
    
    // Close Audio Contexts
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') { 
        try { inputContextRef.current.close(); } catch (e) { console.error(e); }
        inputContextRef.current = null; 
    }
    if (outputContextRef.current && outputContextRef.current.state !== 'closed') { 
        try { outputContextRef.current.close(); } catch (e) { console.error(e); }
        outputContextRef.current = null; 
    }

    // Close Gemini Session
    if (sessionRef.current) { 
        try {
            sessionRef.current.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
        sessionRef.current = null; 
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setAudioVolume(0);
    nextStartTimeRef.current = 0;
  }, []);

  const startSession = useCallback(async (modeConfig: GameModeConfig) => {
    if (!aiRef.current || isConnecting || isConnected) return;
    
    setError(null);
    setIsConnecting(true);
    connectionCleanupRef.current = false;

    try {
      // 1. Setup Audio Inputs (Microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Setup Audio Contexts
      // Input: 16kHz for Gemini
      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (inputContext.state === 'suspended') await inputContext.resume();
      inputContextRef.current = inputContext;

      // Output: 24kHz for Playback
      const outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (outputContext.state === 'suspended') await outputContext.resume();
      outputContextRef.current = outputContext;

      console.log(`Connecting to Gemini Live... Mode: ${modeConfig.label}`);

      // 3. Connect to Gemini API
      // We wait for the connection to fully establish before setting up the audio processor loop.
      const session = await aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Gemini WebSocket Opened");
          },
          onmessage: async (message: LiveServerMessage) => {
            if (connectionCleanupRef.current) return;

            // Handle Audio Output from Model
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               if (volumeResetTimeoutRef.current) {
                 clearTimeout(volumeResetTimeoutRef.current);
                 volumeResetTimeoutRef.current = null;
               }

               // Artificial volume for robot speaking visualization
               setAudioVolume(0.5); 
               
               // Ensure monotonic time for gapless playback
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
               
               try {
                   const audioBuffer = await decodeAudioData(decode(base64Audio), outputContext, 24000, 1);
                   const source = outputContext.createBufferSource();
                   source.buffer = audioBuffer;
                   source.connect(outputContext.destination);
                   
                   audioSourcesRef.current.add(source);
                   
                   source.onended = () => {
                       audioSourcesRef.current.delete(source);
                       if (audioSourcesRef.current.size === 0) {
                           // Debounce volume drop
                           if (volumeResetTimeoutRef.current) clearTimeout(volumeResetTimeoutRef.current);
                           volumeResetTimeoutRef.current = setTimeout(() => {
                               if (audioSourcesRef.current.size === 0) {
                                   setAudioVolume(0);
                               }
                           }, 400); 
                       }
                   };

                   source.start(nextStartTimeRef.current);
                   nextStartTimeRef.current += audioBuffer.duration;
               } catch (e) {
                   console.error("Error decoding/playing audio:", e);
               }
            }

            // Handle Interruptions (User spoke while model was talking)
            if (message.serverContent?.interrupted) {
               console.log("Interrupted - stopping output audio");
               if (volumeResetTimeoutRef.current) clearTimeout(volumeResetTimeoutRef.current);
               
               audioSourcesRef.current.forEach(src => {
                   try { src.stop(); } catch (e) { /* ignore */ }
               });
               audioSourcesRef.current.clear();
               setAudioVolume(0);
               nextStartTimeRef.current = outputContext.currentTime;
            }
          },
          onclose: (e) => { 
            console.log("Session closed by server", e);
            if (!connectionCleanupRef.current) {
                stopSession();
            }
          },
          onerror: (err) => {
            console.error("Gemini Live Error:", err);
            if (!connectionCleanupRef.current) {
                setError("A apărut o eroare de conexiune.");
                stopSession();
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: modeConfig.voiceName 
              } 
            } 
          },
          systemInstruction: modeConfig.systemInstruction
        }
      });

      // 4. Connection Successful - Store session and start input stream
      if (connectionCleanupRef.current) {
          // If user cancelled while connecting
          session.close();
          return;
      }

      sessionRef.current = session;
      setIsConnected(true);
      setIsConnecting(false);

      // 5. Setup Input Stream Processing (Only now!)
      const source = inputContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = inputContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
          if (connectionCleanupRef.current || !sessionRef.current) return;
          
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Calculate volume for visualization
          let sum = 0;
          for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
          const rms = Math.sqrt(sum / inputData.length);
          
          if (audioSourcesRef.current.size === 0) {
              setAudioVolume(rms > 0.02 ? rms * 5 : 0);
          }
          
          // Send to Gemini
          try {
              const pcmBlob = createBlob(inputData);
              sessionRef.current.sendRealtimeInput({ media: pcmBlob });
          } catch (err) {
              console.warn("Error sending audio frame:", err);
              // Do not stop session on single frame error, but if it persists, onError will trigger.
          }
      };

      source.connect(processor);
      processor.connect(inputContext.destination);

    } catch (err) {
      console.error("Connection failed:", err);
      setError("Nu s-a putut stabili conexiunea.");
      stopSession();
    }
  }, [isConnected, isConnecting, stopSession]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
        connectionCleanupRef.current = true;
        stopSession();
      }
  }, [stopSession]);

  return {
    isConnected,
    isConnecting,
    audioVolume,
    error,
    startSession,
    stopSession
  };
}