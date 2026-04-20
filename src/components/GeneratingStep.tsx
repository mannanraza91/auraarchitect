import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Loader2, Timer } from 'lucide-react';

const EXPECTED_GEN_MS = 15000; // 15 seconds estimated

export function GeneratingStep() {
  const { error, setStep } = useAppStore();
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!error) {
      interval = setInterval(() => {
        setElapsedMs(prev => prev + 100);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [error]);

  const percentage = Math.min(99, Math.floor((elapsedMs / EXPECTED_GEN_MS) * 100));
  const remainingSec = Math.max(1, Math.ceil((EXPECTED_GEN_MS - elapsedMs) / 1000));

  return (
    <div className="max-w-xl mx-auto p-6 mt-16 z-10 relative flex flex-col items-center justify-center text-center">
      {error ? (
        <div className="glass-panel-dark p-8 rounded-2xl flex flex-col items-center">
          <h2 className="text-[20px] font-bold text-red-500 mb-4">Generation Failed</h2>
          <p className="text-[#64748B] mb-6">{error}</p>
          <button 
            onClick={() => setStep('input')}
            className="px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[8px] transition-colors font-[700]"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="glass-panel-dark p-12 rounded-2xl flex flex-col items-center shadow-lg w-full">
          <Loader2 className="w-16 h-16 text-[#0EA5E9] animate-spin mb-6" />
          <h2 className="text-[20px] font-[800] text-[#F8FAFC] mb-2 tracking-tight">Analyzing Requirements...</h2>
          <p className="text-[#64748B] font-[600] animate-pulse">Running AI Constraint Mapper & Layout Engine</p>
          
          <div className="w-full bg-[#1E293B] h-3 rounded-full mt-8 overflow-hidden relative shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-[#0EA5E9] transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="mt-4 flex justify-between w-full text-[#94A3B8] text-[12px] font-mono">
            <span>{percentage}% Complete</span>
            <span className="flex items-center">
              <Timer className="w-4 h-4 mr-1" />
              ~{remainingSec}s remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
