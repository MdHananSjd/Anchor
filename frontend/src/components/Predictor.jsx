import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LOW_CHURN_PROFILE = {
  "industry": "Finance",
  "country": "United States",
  "referral_source": "Direct",
  "plan_tier": "Enterprise",
  "seats": 150,
  "seats_sub": 150,
  "mrr_amount": 15000.0,
  "signup_date": "2020-01-01",
  "is_trial": false,
  "billing_frequency": "Annual",
  "auto_renew_flag": true,
  "upgrade_flag": true,
  "downgrade_flag": false
};

const HIGH_CHURN_PROFILE = {
  "industry": "Other",
  "country": "United Kingdom",
  "referral_source": "Organic",
  "plan_tier": "Basic",
  "seats": 5,
  "seats_sub": 2,
  "mrr_amount": 50.0,
  "signup_date": "2026-01-01",
  "is_trial": true,
  "billing_frequency": "Monthly",
  "auto_renew_flag": false,
  "upgrade_flag": false,
  "downgrade_flag": true
};

export default function Predictor() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(LOW_CHURN_PROFILE, null, 2));
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const loadPreset = (profile) => {
    setJsonInput(JSON.stringify(profile, null, 2));
    setResult(null);
    setError(null);
  };

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (e) {
      setError("Please ensure valid JSON syntax before proceeding.");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(r => setTimeout(r, 600));

      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Connection to inference engine failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="predictor-wrapper">
      <div className="predictor-header">
        <h1>Predictive Metrics.</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Input customer telemetry directly to evaluate retention integrity.</p>
      </div>

      <div className="predictor-grid">
        {/* Left Column: Input Form */}
        <div className="dawn-card input-panel">
          <div className="preset-row">
            <button className="preset-pill" onClick={() => loadPreset(LOW_CHURN_PROFILE)}>
              Simulate Secure Client
            </button>
            <button className="preset-pill" onClick={() => loadPreset(HIGH_CHURN_PROFILE)}>
              Simulate At-Risk Client
            </button>
          </div>
          
          <textarea 
            rows="16"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            spellCheck="false"
          />
          
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button 
              className="btn btn-primary" 
              onClick={handlePredict}
              disabled={isLoading}
            >
              Run Inference
            </button>
            
            {error && (
              <span style={{ color: 'var(--color-danger-strong)', fontSize: '0.85rem' }}>
                {error}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="dawn-card results-panel">
          
          {!result && !isLoading && (
            <div className="loading-state">
              <p>Awaiting telemetry mapping...</p>
            </div>
          )}

          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Evaluating weights securely...</p>
            </div>
          )}

          {result && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="result-gauge-container">
                <div 
                  className="gauge-value"
                  style={{ color: result.is_churn_risk ? 'var(--color-danger-strong)' : 'var(--color-safe-strong)' }}
                >
                  {(result.churn_probability * 100).toFixed(1)}%
                </div>
                <div className="gauge-label">Attritional Risk Level</div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', color: 'var(--color-text-tertiary)' }}>
                  Primary Influence Drivers
                </h4>
                
                {Object.entries(result.top_drivers).map(([key, val], index) => {
                  const absVal = Math.abs(val);
                  const isPositive = val > 0;
                  const widthPct = Math.min((absVal / 2.5) * 100, 100);
                  
                  return (
                    <motion.div 
                      key={key} 
                      className="driver-item"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="driver-header">
                        <span style={{ fontWeight: 500 }}>{key}</span>
                        <span style={{ color: isPositive ? 'var(--color-danger-strong)' : 'var(--color-text-secondary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                          {isPositive ? '+' : ''}{val.toFixed(3)}
                        </span>
                      </div>
                      <div className="driver-bar-bg">
                        <motion.div 
                          className="driver-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                          style={{
                            background: isPositive 
                              ? 'linear-gradient(90deg, #FFF0F0, #D94A4A)' 
                              : 'linear-gradient(90deg, #F3F1EC, #888888)'
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
