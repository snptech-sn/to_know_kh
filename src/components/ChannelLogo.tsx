import React from 'react';
import channelLogoAsset from '../assets/images/channel_logo_1788530726466.jpg';

interface ChannelLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const ChannelLogo: React.FC<ChannelLogoProps> = ({
  className = '',
  size = 'md',
  showGlow = true,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-11 sm:h-11',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-md pointer-events-none transform scale-110" />
      )}
      <div className="relative w-full h-full rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 shadow-xl ring-1 ring-white/20">
        <img
          src={channelLogoAsset}
          alt="នាំដឹង - TO KNOW Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-full select-none"
          onError={(e) => {
            // Fallback to public folder path if asset import differs in environment
            const target = e.currentTarget;
            if (!target.src.includes('channel_logo.jpg')) {
              target.src = './channel_logo.jpg';
            }
          }}
        />
      </div>
    </div>
  );
};
