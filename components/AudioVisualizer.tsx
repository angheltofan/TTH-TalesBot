import React from 'react';

interface AudioVisualizerProps {
  volume: number;
  isConnected: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ volume, isConnected }) => {
  const bars = [0, 1, 2];
  const isActive = isConnected && volume > 0.01;
  const animClasses = ['animate-wave', 'animate-wave-fast', 'animate-wave-delayed'];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className="absolute right-full mr-2 flex items-center gap-1.5 h-24">
        {bars.map((i) => (
            <div 
              key={`l-${i}`}
              className={`w-1.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] ${isActive ? animClasses[i % 3] : ''}`}
              style={{
                height: isActive ? '20px' : '6px', 
                opacity: isConnected ? 0.9 - (i * 0.15) : 0,
                transition: 'opacity 0.3s ease, height 0.3s ease'
              }}
            />
        ))}
      </div>

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

export default AudioVisualizer;