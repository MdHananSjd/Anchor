import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, CheckCircle, AlertTriangle } from 'lucide-react';

const MESSAGES = [
  'Waking up prediction engine...',
  'Fetching model weights from GCS...',
  'Aligning categorical metadata...',
  'Calculating SHAP feature drivers...'
];

export default function LoadingOverlay({ status, errorMessage }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (status === 'loading') {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
      }, 3000);
    } else {
      setMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  if (status === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl"
      >
        <div className="w-80 p-8 bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col items-center text-center">
          
          {status === 'loading' && (
            <>
              <div className="relative flex items-center justify-center mb-8 mt-2">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-20 h-20 bg-blue-500/20 rounded-full blur-xl"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="relative z-10 text-blue-400"
                >
                  <Anchor size={40} strokeWidth={1.5} />
                </motion.div>
              </div>
              
              <div className="h-10 w-full overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-slate-200 text-sm font-medium tracking-wide absolute w-full left-0"
                  >
                    {MESSAGES[messageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-4"
            >
              <CheckCircle className="w-14 h-14 text-emerald-400 mb-4" />
              <p className="text-emerald-300 text-sm font-medium">Analysis Complete</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-4"
            >
              <AlertTriangle className="w-14 h-14 text-rose-400 mb-4" />
              <p className="text-rose-300 text-sm font-medium mb-2">Inference Failed</p>
              <p className="text-slate-400 text-xs">{errorMessage}</p>
            </motion.div>
          )}
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
