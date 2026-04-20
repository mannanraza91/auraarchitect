import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { Plan2DView } from './Plan2DView';
import { Plan3DView } from './Plan3DView';
import { Download, Edit3, ArrowLeft, Layers, Cuboid, DollarSign, Palette } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ResultsStep() {
  const { setStep, layout, activeFloor, setActiveFloor, generationTimeMs } = useAppStore();
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#0BA1F' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('Aura_Architect_Blueprint.pdf');
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Failed to export PDF.");
    }
  };

  const { selectedElement, baseCostPerSqFt, setBaseCostPerSqFt } = useAppStore();
  
  // Resolve active floor
  const currentFloor = layout?.floors.find(f => f.level === activeFloor) || layout?.floors[0];

  const selectedRoom = selectedElement?.type === 'room' && currentFloor 
    ? currentFloor.rooms.find(r => r.id === selectedElement.id) 
    : null;

  // Calculate generic total area
  const baseArea = layout ? layout.plot.width * layout.plot.length : 0;
  const numFloors = layout?.floors.length || 1;
  const totalArea = baseArea * numFloors;
  const estimatedCost = totalArea * baseCostPerSqFt;
  
  const totalRoomsCount = layout?.floors.reduce((acc, f) => acc + f.rooms.length, 0) || 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 mt-4 z-10 relative flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
      
      <div className="glass-panel-dark p-2 rounded-[12px] flex-grow relative flex justify-center items-center overflow-hidden h-full">
        
        <div className="absolute top-5 left-5 z-10 pointer-events-auto flex flex-col gap-2">
           <div className="flex gap-2">
             {layout?.floors.map(floor => (
               <button 
                 key={floor.level}
                 onClick={() => setActiveFloor(floor.level)}
                 className={`text-[12px] font-bold px-3 py-1.5 rounded-[6px] border ${activeFloor === floor.level ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'bg-[#0F172A]/80 text-[#94A3B8] border-white/10'} hover:bg-[#0EA5E9]/50 transition-colors backdrop-blur-sm`}
               >
                 {floor.name.toUpperCase()}
               </button>
             ))}
           </div>
        </div>

        {/* North Arrow Decoration */}
        <div className="absolute top-5 right-5 text-white text-center z-10 pointer-events-none">
          <div className="text-[24px] leading-none">N</div>
          <div className="text-[10px] opacity-60">Orientation</div>
        </div>

        {activeTab === '2d' ? (
          <Plan2DView containerRef={printRef} />
        ) : (
          <Plan3DView />
        )}

        {/* Footer Tools Bar inside canvas */}
        <div className="absolute bottom-5 left-5 right-5 flex justify-between z-10 pointer-events-none">
          <div className="flex gap-[10px] pointer-events-auto">
            <button 
              onClick={() => setActiveTab('2d')}
              className={`bg-white/10 backdrop-blur-md border border-white/10 text-white py-2 px-4 rounded-[20px] text-[12px] cursor-pointer flex items-center gap-2 transition-colors ${activeTab === '2d' ? 'bg-[#0EA5E9]/30' : ''}`}
            >
              2D VIEW
            </button>
            <button 
              onClick={() => setActiveTab('3d')}
              className={`bg-white/10 backdrop-blur-md border border-white/10 text-white py-2 px-4 rounded-[20px] text-[12px] cursor-pointer flex items-center gap-2 transition-colors ${activeTab === '3d' ? 'bg-[#0EA5E9]/30' : ''}`}
            >
              <span>3D RENDER</span><span className="bg-[#0EA5E9] py-[2px] px-2 rounded-[4px] text-[9px] uppercase font-[700]">PRO</span>
            </button>
          </div>
          <div className="flex gap-[10px] pointer-events-auto">
            <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white py-2 px-4 rounded-[20px] text-[12px] cursor-pointer flex items-center gap-2" onClick={() => setStep('input')}>
              EDIT REQ
            </button>
            {activeTab === '2d' && (
              <button onClick={handleExportPDF} className="bg-white text-[#020617] py-2 px-4 rounded-[20px] text-[12px] font-bold cursor-pointer transition flex items-center hover:bg-gray-200">
                DOWNLOAD PDF
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full md:w-[320px] flex flex-col gap-4 overflow-y-auto hidden-scrollbar">
        {/* Cost Estimation Panel */}
        <div className="bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/30 rounded-[12px] p-5 shadow-lg">
          <h3 className="text-[#38BDF8] text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4" /> Cost Estimator
          </h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#94A3B8] text-[12px]">Total Plot Area</span>
            <span className="text-white font-mono">{totalArea} sq ft</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#94A3B8] text-[12px]">Total Rooms</span>
            <span className="text-white font-mono">{totalRoomsCount}</span>
          </div>
          <div className="mb-4">
            <label className="text-[#94A3B8] text-[10px] mb-1 block">Cost per Sq Ft (INR)</label>
            <input 
              type="number" 
              value={baseCostPerSqFt}
              onChange={(e) => setBaseCostPerSqFt(Number(e.target.value) || 0)}
              className="w-full bg-[#020617] border border-[#334155] rounded-[6px] px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#0EA5E9]"
            />
          </div>
          <div className="pt-3 border-t border-[#334155]">
            <span className="text-[#94A3B8] text-[11px] block text-center mb-1">Estimated Budget</span>
            <span className="text-[#10B981] text-[24px] font-extrabold block text-center">
              ₹ {estimatedCost.toLocaleString('en-IN')}
            </span>
            {generationTimeMs > 0 && (
              <span className="text-[#64748B] text-[10px] block text-center mt-2 italic">
                AI Generated in {(generationTimeMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>
        </div>

        {/* Interior Recommendations Panel */}
        <div className="bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/30 rounded-[12px] p-5 shadow-lg flex-1">
          <h3 className="text-[#38BDF8] text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4" /> Interior Design
          </h3>
          
          {selectedRoom && selectedRoom.interior ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h4 className="text-white text-[16px] font-bold capitalize mb-1">{selectedRoom.name}</h4>
              <p className="text-[#0EA5E9] text-[11px] font-semibold mb-4 uppercase tracking-wider">{selectedRoom.interior.style}</p>
              
              <div className="mb-4">
                <span className="text-[#64748B] text-[10px] uppercase block mb-2 font-bold">Color Theme</span>
                <div className="flex gap-2">
                  {selectedRoom.interior.colors.map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>
              </div>
              
              <div>
                 <span className="text-[#64748B] text-[10px] uppercase block mb-1 font-bold">Recommendation</span>
                 <p className="text-[#CBD5E1] text-[12px] leading-relaxed">
                   {selectedRoom.interior.description}
                 </p>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-center px-4">
               <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center mb-3">
                 <Cuboid className="w-5 h-5 text-[#64748B]" />
               </div>
               <p className="text-[#94A3B8] text-[12px] leading-relaxed">
                 Select a room in the 3D model to view personalized AI interior design recommendations.
               </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
