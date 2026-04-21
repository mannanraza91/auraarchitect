import React from 'react';
import { useAppStore } from '../store';
import { Plan2DView } from './Plan2DView';
import { FileText, MapPin, Ruler, Coins, Sparkles, ShieldCheck } from 'lucide-react';

export function BuildingProposalView({ containerRef }: { containerRef?: React.RefObject<HTMLDivElement> }) {
  const { layout, unit, requirements, baseCostPerSqFt } = useAppStore();
  
  if (!layout) return null;

  const totalArea = layout.plot.width * layout.plot.length * layout.floors.length;
  const estimatedCost = totalArea * baseCostPerSqFt;

  return (
    <div 
      ref={containerRef}
      className="bg-white text-black p-12 w-[850px] mx-auto shadow-none font-sans"
    >
      {/* Cover Page */}
      <div className="min-h-[1000px] flex flex-col justify-between border-b-2 border-black pb-12 mb-12">
        <div className="flex justify-between items-start">
          <div className="border-2 border-black px-4 py-2 flex items-center gap-2">
             <div className="font-bold text-[18px]">A</div>
             <div className="font-bold text-[12px] uppercase tracking-wider">Aura Architect</div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold uppercase text-[#6B7280]">Document: AA-{(Math.random() * 10000).toFixed(0)}-TECH</p>
             <p className="text-[11px] font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="py-24 border-y-2 border-black">
          <h2 className="text-[48px] font-bold uppercase text-center tracking-tight">
            Building Layout <br />
            & Technical Specs
          </h2>
          <div className="w-16 h-1 bg-black mx-auto mt-8"></div>
        </div>

        <div className="grid grid-cols-2 gap-12 pt-12">
           <div>
              <p className="text-[10px] uppercase font-bold text-[#94A3B8] mb-2">Subject Site</p>
              <p className="text-[20px] font-bold uppercase">{layout.plot.width} x {layout.plot.length} {unit} Plot</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-[#94A3B8] mb-2">Status</p>
              <p className="text-[20px] font-bold uppercase">Technical Draft</p>
           </div>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="min-h-[1000px] py-12 border-b-2 border-black mb-12">
        <h3 className="text-[28px] font-bold uppercase mb-8 border-b border-black pb-2">01. Site Data</h3>
        
        <div className="grid grid-cols-2 gap-8 mb-12">
           <div className="border-2 border-black p-6">
              <p className="text-[10px] uppercase font-bold text-[#6B7280] mb-4">Core Dimensions</p>
              <div className="space-y-4">
                 <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                    <span className="text-[12px] font-bold uppercase">Total Area</span>
                    <span className="text-[14px] font-mono">{totalArea.toLocaleString()} {unit}²</span>
                 </div>
                 <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                    <span className="text-[12px] font-bold uppercase">Building Height</span>
                    <span className="text-[14px] font-mono">{layout.floors.length} Storeys</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-[12px] font-bold uppercase">Estimated Value</span>
                    <span className="text-[14px] font-mono">₹ {estimatedCost.toLocaleString('en-IN')}</span>
                 </div>
              </div>
           </div>
           <div>
              <p className="text-[10px] uppercase font-bold text-[#6B7280] mb-4">Design Requirement Summary</p>
              <p className="text-[13px] text-[#1E293B] leading-relaxed font-medium bg-[#F8FAFC] p-4 border italic">
                "{requirements}"
              </p>
           </div>
        </div>

        <div className="border-t-2 border-black pt-8">
           <h4 className="text-[14px] font-bold uppercase mb-4 tracking-widest">Compliance & Features</h4>
           <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 border">
                 <p className="text-[9px] font-bold uppercase text-[#94A3B8] mb-1">Vastu Rule</p>
                 <p className="text-[12px] font-bold">{layout.floors[0].rooms.some(r => r.type === 'kitchen') ? 'Applied' : 'Neutral'}</p>
              </div>
              <div className="text-center p-4 border">
                 <p className="text-[9px] font-bold uppercase text-[#94A3B8] mb-1">Ventilation</p>
                 <p className="text-[12px] font-bold">Optimized</p>
              </div>
              <div className="text-center p-4 border">
                 <p className="text-[9px] font-bold uppercase text-[#94A3B8] mb-1">Structural</p>
                 <p className="text-[12px] font-bold">Load-Aligned</p>
              </div>
           </div>
        </div>
      </div>

      {/* Sequential Floor Designs */}
      {layout.floors.map((floor, fIdx) => (
         <div key={floor.level} className="min-h-[1000px] py-12 border-b-2 border-black mb-12">
            <h3 className="text-[28px] font-bold uppercase mb-8 border-b border-black pb-2">
               0{fIdx + 2}. {floor.name} Layout
            </h3>

            <div className="border border-black p-4 mb-8 bg-white">
               <div className="w-full transform scale-90 origin-center">
                  <Plan2DView theme="bw" forceFloor={floor.level} />
               </div>
            </div>

            <h4 className="text-[12px] font-bold uppercase mb-4 tracking-widest bg-black text-white px-3 py-1 w-max">Portion Schedule</h4>
            
            <div className="w-full border border-black">
               <div className="grid grid-cols-4 bg-[#F1F5F9] border-b border-black font-bold text-[10px] uppercase">
                  <div className="p-2 border-r border-black">Portion</div>
                  <div className="p-2 border-r border-black">Size ({unit})</div>
                  <div className="p-2">Utility & Working Purpose</div>
               </div>
               {floor.rooms.map((room) => (
                  <div key={room.id} className="grid grid-cols-4 border-b border-black last:border-b-0 text-[11px]">
                     <div className="p-2 border-r border-black font-bold">{room.name}</div>
                     <div className="p-2 border-r border-black font-mono">{room.width} x {room.length}</div>
                     <div className="p-2 col-span-2 leading-tight">
                        {room.interior?.description || "Technical functional zone."}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      ))}

      {/* Footer / Certification */}
      <div className="flex flex-col items-center justify-center py-24 italic">
         <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-bold text-[24px] mb-4">A</div>
         <p className="font-bold text-[18px] uppercase tracking-tighter mb-1">Aura Architect by Mannan Raza</p>
         <p className="text-[10px] uppercase tracking-widest text-[#94A3B8]">Technical Document Ends</p>
      </div>
    </div>
  );
}
