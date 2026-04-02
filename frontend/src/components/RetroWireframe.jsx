import React from 'react';

export default function RetroWireframe() {
  return (
    <div className="wireframe-canvas">
      <div className="crt-overlay"></div>
      <div className="scene">
        <div className="cube">
          <div className="core">ANCHOR_CORE</div>
          <div className="dot d1"></div>
          <div className="dot d2"></div>
          <div className="dot d3"></div>
          <div className="dot d4"></div>
          <div className="dot d5"></div>
          <div className="dot d6"></div>
          <div className="dot d7"></div>
          <div className="dot d8"></div>
        </div>
      </div>
      <style>{`
        .crt-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
          z-index: 10;
          pointer-events: none;
        }
        .scene {
          perspective: 600px;
          transform-style: preserve-3d;
        }
        .cube {
          position: relative;
          color: #00FF00; /* Retro phosphor green */
          font-family: monospace;
          transform-style: preserve-3d;
          animation: spin 10s infinite linear;
        }
        .core {
          position: absolute;
          top: -10px; left: -50px;
          border: 1px dotted #00FF00;
          padding: 2px;
          background: #000;
          font-weight: bold;
        }
        .dot {
          position: absolute;
          width: 6px; height: 6px;
          background: #00FF00;
          border-radius: 0; /* Retro solid blocks */
        }
        
        /* 8 Nodes orbiting/connecting to center */
        .d1 { transform: translate3d(80px, 80px, 80px); }
        .d2 { transform: translate3d(-80px, 80px, 80px); }
        .d3 { transform: translate3d(80px, -80px, 80px); }
        .d4 { transform: translate3d(-80px, -80px, 80px); }
        .d5 { transform: translate3d(80px, 80px, -80px); }
        .d6 { transform: translate3d(-80px, 80px, -80px); }
        .d7 { transform: translate3d(80px, -80px, -80px); }
        .d8 { transform: translate3d(-80px, -80px, -80px); }
        
        .cube::before, .cube::after {
          content: '';
          position: absolute;
          width: 160px; height: 160px;
          border: 1px dashed #008800;
          top: -80px; left: -80px;
        }
        .cube::before { transform: translateZ(80px); }
        .cube::after { transform: translateZ(-80px); }
        
        @keyframes spin {
          from { transform: rotateX(0deg) rotateY(0deg); }
          to { transform: rotateX(360deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
