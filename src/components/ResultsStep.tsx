import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { Plan2DView } from './Plan2DView';
import { Plan3DView } from './Plan3DView';
import { BuildingProposalView } from './BuildingProposalView';
import { Download, Edit3, ArrowLeft, Layers, Cuboid, DollarSign, Palette, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ResultsStep() {
  const { setStep, layout, activeFloor, setActiveFloor, generationTimeMs } = useAppStore();
  const [activeTab, setActiveTab] = useState<'2d' | '3d' | 'proposal'>('2d');
  const printRef = useRef<HTMLDivElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    const targetRef = activeTab === 'proposal' ? proposalRef : printRef;
    if (!targetRef.current) return;
    
    try {
      if (activeTab === 'proposal') {
        const doc = new jsPDF('p', 'pt', 'a4');
        const canvas = await html2canvas(targetRef.current, { 
          scale: 2, 
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          scrollY: -window.scrollY // Ensure we capture the whole fixed width div
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add the first page
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
        
        // Add additional pages if content overflows
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
        }
        
        doc.save(`Architect_Proposal_${(Math.random() * 1000).toFixed(0)}.pdf`);
      } else {
        // 2D Layout Plan - Professional Centered Single Page
        const doc = new jsPDF('l', 'pt', 'a4'); // Landscape usually better for plans
        
        // Temporarily swap theme to bw for clean export if it's currently dark
        const canvas = await html2canvas(targetRef.current, { 
          scale: 3, 
          backgroundColor: '#ffffff', // Professional white paper background
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Calculate centered dimensions (keeping aspect ratio, fitting 90% of page)
        const margin = 40;
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
        const imgWidth = canvas.width * ratio;
        const imgHeight = canvas.height * ratio;
        
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        // Add title and branding to the PDF for professionalism
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Aura Architect - Technical Layout Plan", pageWidth / 2, 40, { align: 'center' });
        
        doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text("Aura Architect by Mannan Raza | Blueprint Series", pageWidth / 2, pageHeight - 30, { align: 'center' });
        
        doc.save(`Architectural_Layout_${(Math.random() * 1000).toFixed(0)}.pdf`);
      }
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Failed to export professional PDF. Please try again.");
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
        ) : activeTab === '3d' ? (
          <Plan3DView />
        ) : (
          <div className="w-full h-full overflow-y-auto hidden-scrollbar p-10 bg-[#020617]/50">
             <BuildingProposalView containerRef={proposalRef} />
          </div>
        )}

        {/* Footer Tools Bar inside canvas */}
        <div className="absolute bottom-5 left-5 right-5 flex justify-between z-10 pointer-events-none">
          <div className="flex gap-[10px] pointer-events-auto">
            <button 
              onClick={() => setActiveTab('2d')}
              className={`bg-white/10 backdrop-blur-md border border-white/10 text-white py-2 px-4 rounded-[20px] text-[12px] cursor-pointer flex items-center gap-2 transition-colors ${activeTab === '2d' ? 'bg-[#0EA5E9]/30 border-[#0EA5E9]/50' : ''}`}
            >
              2D VIEW
            </button>
            <button 
              onClick={() => setActiveTab('3d')}
              className={`bg-white/10 backdrop-blur-md border border-white/10 text-white py-2 px-4 rounded-[20px] text-[12px] cursor-pointer flex items-center gap-2 transition-colors ${activeTab === '3d' ? 'bg-[#0EA5E9]/30 border-[#0EA5E9]/50' : ''}`}
            >
              <span>3D RENDER</span><span className="bg-[#0EA5E9] py-[2px] px-2 rounded-[4px] text-[9px] uppercase font-[700]">PRO</span>
            </button>
            <button 
              onClick={() => setActiveTab('proposal')}
              className={`bg-white/10 backdrop-blur-md border border-white/10 text-white py-2 px-4 rounded-[20px] text-[12px] cursor-pointer flex items-center gap-2 transition-colors ${activeTab === 'proposal' ? 'bg-[#0EA5E9]/30 border-[#0EA5E9]/50' : ''}`}
            >
              <FileSpreadsheet className="w-4 h-4" /> FULL PROPOSAL
            </button>
          </div>
          <div className="flex gap-[10px] pointer-events-auto">
            <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white py-2 px-4 rounded-[20px] text-[12px] cursor-pointer flex items-center gap-2" onClick={() => setStep('input')}>
              EDIT REQ
            </button>
            {(activeTab === '2d' || activeTab === 'proposal') && (
              <button 
                onClick={handleExportPDF} 
                className="bg-white text-[#020617] py-2 px-4 rounded-[20px] text-[12px] font-bold cursor-pointer transition flex items-center gap-2 hover:bg-gray-200"
              >
                <Download className="w-4 h-4" /> DOWNLOAD {activeTab === 'proposal' ? 'PROPOSAL' : 'PDF'}
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
