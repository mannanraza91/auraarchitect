import React from 'react';

export function Header() {
  return (
    <header className="bg-[#020617]/50 backdrop-blur-md border-b border-[#38BDF8]/30 py-3 px-6 h-[70px] shrink-0 flex flex-col items-center justify-center z-10 relative">
      <h1 className="text-[28px] font-[800] tracking-[-0.5px] text-[#38BDF8] m-0 leading-none">
        Aura Architect
      </h1>
      <p className="text-[10px] font-[600] text-[#0EA5E9] uppercase tracking-[2px] mt-1 m-0">
        BY MANNAN RAZA
      </p>
    </header>
  );
}
