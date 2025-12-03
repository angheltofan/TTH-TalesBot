import React, { useState } from 'react';
import { Volume2, RefreshCw } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

// Fallback SVG
const ROBOT_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ffffff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e0f7fa;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='100' cy='100' r='90' fill='url(%23grad1)' stroke='%2300AEEF' stroke-width='4'/%3E%3Crect x='55' y='60' width='90' height='70' rx='15' ry='15' fill='%2300AEEF' /%3E%3Ccircle cx='80' cy='90' r='8' fill='white'/%3E%3Ccircle cx='120' cy='90' r='8' fill='white'/%3E%3Cpath d='M85,110 Q100,120 115,110' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Cline x1='100' y1='60' x2='100' y2='30' stroke='%2300AEEF' stroke-width='6'/%3E%3Ccircle cx='100' cy='25' r='8' fill='%23fbbf24'/%3E%3Ctext x='100' y='160' font-family='sans-serif' font-size='18' text-anchor='middle' fill='%2300AEEF' font-weight='normal'%3ETTH%3C/text%3E%3C/svg%3E`;

interface RobotAvatarProps {
  isConnected: boolean;
  audioVolume: number;
  arePromptsLoading: boolean;
  error: string | null;
}

const RobotAvatar: React.FC<RobotAvatarProps> = ({ isConnected, audioVolume, arePromptsLoading, error }) => {
  const [imgSrc, setImgSrc] = useState("tales_tech_logo.png");

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative landscape:w-1/2 landscape:h-full py-4">
        
        <div className="text-center mb-6 landscape:hidden animate-fade-in-down">
            <h1 className="text-3xl font-normal tracking-tight drop-shadow-sm text-white">TTH - Tale Bot</h1>
            <p className="text-sm font-normal text-cyan-50 mt-1 opacity-90">Asistentul de joacă al Tales&Tech</p>
        </div>

        <div className="relative flex items-center justify-center w-full max-w-[280px] aspect-square">
            <div className={`absolute inset-0 bg-cyan-200/30 rounded-full blur-[60px] transition-all duration-700 ${isConnected ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`}></div>
            
            <AudioVisualizer volume={audioVolume} isConnected={isConnected} />

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
            
            {isConnected && (
                <div className="absolute -bottom-6 bg-white/95 text-[#00AEEF] px-5 py-2 rounded-full font-normal text-[11px] uppercase tracking-widest shadow-xl animate-fade-in-up z-20 flex items-center gap-2">
                    <Volume2 size={14} className="animate-pulse" />
                    Ascult...
                </div>
            )}
        </div>

        {/* Config Loading Indicator (Subtle) */}
        {arePromptsLoading && !isConnected && (
             <div className="absolute bottom-20 opacity-60 flex items-center gap-2 text-xs bg-black/20 px-3 py-1 rounded-full">
                <RefreshCw size={10} className="animate-spin" />
                Actualizare config...
             </div>
        )}

        {error && (
            <div className="absolute top-4 bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-normal shadow-lg animate-bounce z-50 text-center max-w-[90%]">
                {error}
            </div>
        )}
    </div>
  );
};

export default RobotAvatar;