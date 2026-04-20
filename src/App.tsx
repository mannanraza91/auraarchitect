/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from './store';
import { Header } from './components/Header';
import { InputStep } from './components/InputStep';
import { GeneratingStep } from './components/GeneratingStep';
import { ResultsStep } from './components/ResultsStep';

export default function App() {
  const { step } = useAppStore();

  return (
    <div className={`min-h-screen flex flex-col ${step === 'results' ? 'galaxy-bg' : 'bg-[#0B1120]'}`}>
      <Header />
      
      <main className="flex-grow flex flex-col items-center w-full relative z-10">
        {step === 'input' && <InputStep />}
        {step === 'generating' && <GeneratingStep />}
        {step === 'results' && <ResultsStep />}
      </main>

      {step !== 'results' && (
        <footer className="w-full py-6 text-center text-[#94A3B8] text-[10px] z-10 relative mt-auto">
          &copy; {new Date().getFullYear()} Aura Architect. All rights reserved. | Engine: CV-Hybrid Grid
        </footer>
      )}
    </div>
  );
}
