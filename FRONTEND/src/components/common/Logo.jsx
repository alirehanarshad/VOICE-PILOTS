import React from 'react';

const Logo = ({ className = "h-51", onViewChange }) => (
  <div
    className="cursor-pointer inline-flex items-center"
    onClick={(e) => {
      e.stopPropagation();
      if (onViewChange) onViewChange('landing');
    }}
  >
    <img
      src="/voicepilots__1.png"
      alt="VoicePilots Logo"
      className={className}
    />
  </div>
);

export default Logo;
