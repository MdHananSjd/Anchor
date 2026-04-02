import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import CoreOrbital from './CoreOrbital';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        Predict churn.<br />Preserve revenue.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        A high-fidelity machine learning protocol designed to map user telemetry and preemptively seal revenue leaks before they materialize.
                    </motion.p>
                    <motion.button
                        className="btn btn-primary"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        onClick={() => navigate('/predict')}
                    >
                        Open Predictor Console
                    </motion.button>
                </div>
                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
                >
                    <CoreOrbital />
                </motion.div>
            </section>

            {/* Description Concept Section */}
            <section className="description-section">
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    Anchor is not just another analytics dashboard. We sit at the intersection of raw data and predictive behavior. By unifying billing cycles and product usage into a single multi-dimensional tensor array, Anchor identifies the exact moment a customer loses momentum—days or weeks before they actually hit 'Cancel'.
                </motion.p>
            </section>

            {/* Relevance / Features Section (Bento Grid layout) */}
            <section className="relevance-section">
                <div className="relevance-inner">
                    <div className="bento-grid">
                        <div className="bento-card">
                            <div className="bento-icon">
                                <Activity size={24} strokeWidth={1.5} />
                            </div>
                            <h3>Algorithmic Precision</h3>
                            <p>State-of-the-art tree-based models parsing high-dimensional feature spaces to identify churn probabilities with statistical certainty.</p>
                        </div>

                        <div className="bento-card">
                            <div className="bento-icon">
                                <Zap size={24} strokeWidth={1.5} />
                            </div>
                            <h3>Sub-Second Inference</h3>
                            <p>Backed by a lightweight FastAPI layer granting sub-second latency, converting mass telemetry into instantaneous strategic directives.</p>
                        </div>

                        <div className="bento-card">
                            <div className="bento-icon">
                                <ShieldCheck size={24} strokeWidth={1.5} />
                            </div>
                            <h3>Interpretive Drivers</h3>
                            <p>Predictive probabilities are illuminated fully through SHAP analysis arrays, ensuring transparent visibility into exactly *why* users detach.</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
