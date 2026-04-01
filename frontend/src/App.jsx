import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, Settings2, Activity, ShieldAlert, Cpu } from 'lucide-react';
import './App.css';
import landingImg from './assets/anchor.png'; // Assuming image is placed here

function App() {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify({
      industry: "Technology",
      country: "United States",
      referral_source: "Organic",
      plan_tier: "Enterprise",
      seats: 50,
      seats_sub: 50,
      mrr_amount: 5000.0,
      signup_date: "2025-01-01",
      is_trial: false,
      billing_frequency: "Annual",
      auto_renew_flag: true,
      upgrade_flag: false,
      downgrade_flag: false
    }, null, 2)
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (e) {
      setError("Invalid JSON format. Please check your syntax.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch prediction");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Background Orbs */}
      <div className="bg-mesh">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="main-content">
        <nav>
          <div className="logo">
            <Anchor size={28} color="#00F0FF" />
            ANCHOR
          </div>
          <div className="nav-links glass-panel" style={{ padding: '0.5rem 1.5rem', borderRadius: '50px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>v2.0 Churn Oracle</span>
          </div>
        </nav>

        {/* Landing Section */}
        <motion.section 
          className="landing-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-text">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Predict Churn.<br />Preserve Revenue.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Upload customer telemetry to our advanced machine learning fabric. Experience deep insights with crystal clarity.
            </motion.p>
            <motion.button 
              className="glass-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              onClick={() => {
                document.getElementById('predictor-section').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Initialize Scan
            </motion.button>
          </div>
          <motion.div 
            className="hero-image-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            {/* Displaying generated image */}
            <img src={landingImg} alt="Anchor 3D Glass Graphic" className="hero-image" />
          </motion.div>
        </motion.section>

        {/* Predictor Section */}
        <section id="predictor-section" className="predictor-grid">
          
          <div className="glass-panel json-panel">
            <h2><Settings2 size={24} /> Input Telemetry</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Paste customer profile JSON here. The ML model requires specific feature alignments to process the prediction perfectly.
            </p>
            
            <textarea 
              className="glass-input" 
              rows="16"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              spellCheck="false"
            />
            
            <button 
              className="glass-button" 
              onClick={handlePredict}
              disabled={isLoading}
              style={{ marginTop: '1rem' }}
            >
              {isLoading ? 'Analyzing...' : 'Run Prediction Model'}
            </button>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="error-message"
              >
                <ShieldAlert size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                {error}
              </motion.div>
            )}
          </div>

          <div className="glass-panel result-panel">
            {!result && !isLoading && (
              <div className="empty-state">
                <Cpu size={48} strokeWidth={1} />
                <p>Awaiting Telemetry payload to begin synthesis.</p>
              </div>
            )}
            
            {isLoading && (
              <div className="empty-state" style={{ color: 'var(--accent-cyan)' }}>
                <Activity size={48} strokeWidth={1} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
                <p>Neural synthesis in progress...</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {result && !isLoading && (
              <motion.div 
                className="results-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity color="var(--accent-cyan)" /> 
                  Analysis Report
                </h2>
                
                <div className="probability-circle" style={{
                  boxShadow: result.is_churn_risk 
                     ? 'inset 0 0 40px rgba(255, 0, 229, 0.2)' 
                     : 'inset 0 0 40px rgba(0, 240, 255, 0.2)'
                }}>
                  <div className="prob-value" style={{ 
                    color: result.is_churn_risk ? 'var(--accent-magenta)' : 'var(--accent-cyan)' 
                  }}>
                    {(result.churn_probability * 100).toFixed(1)}%
                  </div>
                  <div className="prob-label">Risk Probability</div>
                </div>

                <div className="drivers-list">
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Top Driving Factors</h3>
                  {Object.entries(result.top_drivers).map(([key, val], index) => {
                    // Absolute value used for bar width, but show actual magnitude
                    const absVal = Math.abs(val);
                    // Assume max expected SHAP value is ~2.0 for scaling
                    const widthPct = Math.min((absVal / 2.0) * 100, 100);
                    
                    return (
                      <motion.div 
                        key={key} 
                        className="driver-item"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                      >
                        <div className="driver-header">
                          <span style={{ color: 'var(--text-main)' }}>{key}</span>
                          <span style={{ color: val > 0 ? 'var(--accent-magenta)' : 'var(--accent-cyan)' }}>
                            {val > 0 ? '+' : ''}{val.toFixed(3)}
                          </span>
                        </div>
                        <div className="driver-bar-bg">
                          <motion.div 
                            className="driver-bar-fill" 
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPct}%` }}
                            transition={{ duration: 1, delay: 0.5 + (index * 0.2) }}
                            style={{ 
                              background: val > 0 
                                ? 'linear-gradient(90deg, transparent, var(--accent-magenta))' 
                                : 'linear-gradient(90deg, transparent, var(--accent-cyan))' 
                            }}
                          ></motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
