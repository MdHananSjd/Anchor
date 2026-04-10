import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Anchor, Moon, Sun } from 'lucide-react';
import Home from './components/Home';
import Predictor from './components/Predictor';
import './App.css';

function App() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <div className="app-shell">

      {/* Floating Glass Navigation */}
      <nav className="top-nav glass-nav">
        <div className="nav-brand">
          <Anchor size={20} />
          <Link to="/" className="logo-type">
            Anchor
          </Link>
        </div>

        <div className="nav-links" style={{ marginLeft: '12px' }}>
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/predict" className={`nav-item ${location.pathname === '/predict' ? 'active' : ''}`}>
            Predictor
          </Link>

          <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 8px' }}></div>

          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Dark Mode">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predictor />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;
