import React from 'react';

export default function OrbitalGraphic() {
  return (
    <div style={styles.container}>
      <div style={styles.scene}>
        {/* Orbit Rigs */}
        <div style={{...styles.orbit, ...styles.orbit1}}>
          <div style={styles.satellite}></div>
        </div>
        <div style={{...styles.orbit, ...styles.orbit2}}>
             <div style={{...styles.satellite, background: 'var(--accent-secondary)'}}></div>
             <div style={{...styles.satellite, top: 'auto', bottom: '-4px', right: '50%', background: 'var(--accent-primary)'}}></div>
        </div>
        <div style={{...styles.orbit, ...styles.orbit3}}>
          <div style={{...styles.satellite, background: 'var(--accent-tertiary)'}}></div>
        </div>

        {/* Central Core */}
        <div style={styles.coreContainer}>
          <div style={styles.coreGlow}></div>
          <div style={styles.coreNode}></div>
        </div>
      </div>
      <style>{`
        @keyframes rotate-orbit {
          0% { transform: rotate3d(1, 0.5, 0.2, 0deg); }
          100% { transform: rotate3d(1, 0.5, 0.2, 360deg); }
        }
        @keyframes rotate-orbit-alt {
          0% { transform: rotate3d(-0.5, 1, -0.2, 0deg); }
          100% { transform: rotate3d(-0.5, 1, -0.2, 360deg); }
        }
        @keyframes rotate-orbit-z {
          0% { transform: rotate3d(0.2, -0.5, 1, 0deg); }
          100% { transform: rotate3d(0.2, -0.5, 1, 360deg); }
        }
        @keyframes pulse-core {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(0,255,170,0.5); }
          50% { transform: scale(1.1); box-shadow: 0 0 40px rgba(0,255,170,0.8); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    perspective: '1000px',
  },
  scene: {
    width: '400px',
    height: '400px',
    position: 'relative',
    transformStyle: 'preserve-3d',
  },
  coreContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreGlow: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    background: 'radial-gradient(circle, rgba(0,255,170,0.4) 0%, transparent 60%)',
    borderRadius: '50%',
    animation: 'pulse-core 4s ease-in-out infinite',
  },
  coreNode: {
    width: '40px',
    height: '40px',
    background: 'var(--text-main)',
    borderRadius: '50%',
    boxShadow: '0 0 15px rgba(255,255,255,0.8)',
    zIndex: 10,
  },
  orbit: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '50%',
    transformStyle: 'preserve-3d',
    transformOrigin: 'center center',
  },
  orbit1: {
    width: '240px',
    height: '240px',
    marginLeft: '-120px',
    marginTop: '-120px',
    animation: 'rotate-orbit 12s linear infinite',
  },
  orbit2: {
    width: '320px',
    height: '320px',
    marginLeft: '-160px',
    marginTop: '-160px',
    animation: 'rotate-orbit-alt 18s linear infinite',
  },
  orbit3: {
    width: '400px',
    height: '400px',
    marginLeft: '-200px',
    marginTop: '-200px',
    animation: 'rotate-orbit-z 24s linear infinite',
  },
  satellite: {
    position: 'absolute',
    top: '-4px',
    left: '50%',
    width: '8px',
    height: '8px',
    background: 'var(--text-main)',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(255,255,255,0.8)',
  }
};
