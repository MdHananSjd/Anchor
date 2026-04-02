import React from 'react';
import { motion } from 'framer-motion';

export default function CoreOrbital() {
  const numOrbs = 8;
  const orbs = Array.from({ length: numOrbs });
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Central Core representing Anchor */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, var(--color-bg-surface), var(--color-bg-base))',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 -4px 12px rgba(0,0,0,0.02)',
          border: '1px solid var(--border-subtle)',
          zIndex: 10
        }}
      />
      
      {/* Slow rotating parent holding the connections */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
        }}
      >
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '400px', height: '400px', overflow: 'visible' }}>
          {orbs.map((_, i) => {
            const angle = (i / numOrbs) * Math.PI * 2;
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <line 
                key={`line-${i}`}
                x1="200" y1="200" 
                x2={200 + x} y2={200 + y} 
                stroke="var(--color-text-tertiary)" 
                strokeWidth="1" 
                opacity="0.3"
              />
            );
          })}
        </svg>

        {orbs.map((_, i) => {
          const angle = (i / numOrbs) * Math.PI * 2;
          const radius = 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div key={`orb-${i}`} style={{
              position: 'absolute',
              top: `${200 + y - 10}px`,
              left: `${200 + x - 10}px`,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--color-bg-surface)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid var(--border-subtle)'
            }}></div>
          );
        })}
      </motion.div>

    </div>
  );
}
