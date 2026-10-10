import React from 'react';

const CyberBackground = () => {
  return (
    <div className="ambient-background" aria-hidden="true">
      {/* Subtle modern geometric dot grid */}
      <div className="ambient-dot-grid" />

      {/* Gentle, elegant diffuse radial lighting */}
      <div className="ambient-glow glow-top-center" />
      <div className="ambient-glow glow-bottom-right" />
    </div>
  );
};

export default CyberBackground;
