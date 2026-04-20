import React, { useState } from 'react';
import { useAppStore } from '../store';
import { generateHouseLayout } from '../lib/geminiLayoutEngine';
import { Compass, Settings2, Sparkles, Building } from 'lucide-react';

export function InputStep() {
  const { plotShape, plotWidth, plotBackWidth, plotLength, floorsCount, unit, requirements, isVastuCompliant, setPlotShape, setPlot, setFloorsCount, setRequirements, setVastuCompliant, setStep, setLayout, setError } = useAppStore();
  
  const [shape, setShapeUI] = useState(plotShape);
  const [w, setW] = useState(plotWidth.toString());
  const [bw, setBw] = useState(plotBackWidth.toString());
  const [l, setL] = useState(plotLength.toString());
  const [f, setF] = useState(floorsCount.toString());
  const [u, setU] = useState<typeof unit>(unit);
  const [req, setReq] = useState(requirements);
  const [vastu, setVastu] = useState(isVastuCompliant);
  
  const handleGenerate = async () => {
    const nw = parseFloat(w);
    const nl = parseFloat(l);
    const nbw = shape === 'uneven' ? parseFloat(bw) : nw;
    const nf = parseInt(f, 10);
    
    if (isNaN(nw) || isNaN(nl) || nw <= 0 || nl <= 0 || isNaN(nf) || nf < 1 || isNaN(nbw) || nbw <= 0) {
      alert("Please enter valid dimensions and floors.");
      return;
    }
    if (!req.trim()) {
      alert("Please enter your requirements.");
      return;
    }
    
    setPlotShape(shape);
    setPlot(nw, nl, nbw, u);
    setFloorsCount(nf);
    setRequirements(req);
    setVastuCompliant(vastu);
    setStep('generating');
    setError(null);
    
    const startTime = Date.now();
    try {
      const layoutPlan = await generateHouseLayout(shape, nw, nbw, nl, u, nf, req, vastu);
      const timeMs = Date.now() - startTime;
      setLayout(layoutPlan, timeMs);
      setStep('results');
    } catch (err: any) {
      setStep('input');
      setError(err.message || 'Failed to generate layout.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 my-auto w-full z-10 relative">
      <div className="glass-panel-dark p-8 rounded-2xl flex flex-col gap-6">
        <h2 className="text-[12px] uppercase font-[700] text-[#0369A1] tracking-[1px] mb-2 flex items-center">
          <Building className="mr-2 w-4 h-4" /> Plot Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-full mb-1 bg-[#020617] p-1 rounded-lg flex flex-wrap lg:flex-nowrap gap-2">
            <button 
              className={`flex-1 py-2 text-[12px] font-bold rounded-md transition-all ${shape === 'rectangular' ? 'bg-[#0EA5E9] text-white shadow-sm' : 'text-[#64748B] hover:text-white'}`}
              onClick={() => setShapeUI('rectangular')}
            >
              Rectangular Layout
            </button>
            <button 
              className={`flex-1 py-2 text-[12px] font-bold rounded-md transition-all ${shape === 'uneven' ? 'bg-[#0EA5E9] text-white shadow-sm' : 'text-[#64748B] hover:text-white'}`}
              onClick={() => setShapeUI('uneven')}
            >
              Uneven / Angled (Trapezoid)
            </button>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-[600] text-[#94A3B8]">
              {shape === 'uneven' ? 'Front Width' : 'Width'}
            </label>
            <input 
              type="number" 
              value={w} 
              onChange={(e) => setW(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] rounded-[6px] px-3 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
              placeholder="e.g. 30"
            />
          </div>
          {shape === 'uneven' && (
            <div className="flex flex-col gap-[6px]">
              <label className="text-[11px] font-[600] text-[#94A3B8]">Back Width</label>
              <input 
                type="number" 
                value={bw} 
                onChange={(e) => setBw(e.target.value)}
                className="w-full bg-[#020617] border border-[#334155] rounded-[6px] px-3 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
                placeholder="e.g. 25"
              />
            </div>
          )}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-[600] text-[#94A3B8]">Length / Depth</label>
            <input 
              type="number" 
              value={l} 
              onChange={(e) => setL(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] rounded-[6px] px-3 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
              placeholder="e.g. 40"
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-[600] text-[#94A3B8]">Unit</label>
            <select 
              value={u} 
              onChange={(e) => setU(e.target.value as any)}
              className="w-full bg-[#020617] border border-[#334155] rounded-[6px] px-3 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
            >
              <option value="ft">Feet (ft)</option>
              <option value="m">Meters (m)</option>
            </select>
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-[600] text-[#94A3B8]">Floors</label>
            <select 
              value={f} 
              onChange={(e) => setF(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] rounded-[6px] px-3 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
            >
              <option value="1">1 (Ground only)</option>
              <option value="2">2 (G + 1st)</option>
              <option value="3">3 (G + 1st + 2nd)</option>
              <option value="4">4 (G + 1st + 2nd + 3rd)</option>
            </select>
          </div>
        </div>

        <h2 className="text-[12px] uppercase font-[700] text-[#0369A1] tracking-[1px] mb-2 mt-4 flex items-center">
          <Settings2 className="mr-2 w-4 h-4" /> Requirements
        </h2>
        
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11px] font-[600] text-[#94A3B8]">Describe your vision</label>
          <textarea 
            value={req}
            onChange={(e) => setReq(e.target.value)}
            className="w-full bg-[#020617] border border-[#334155] rounded-[6px] px-3 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all h-[80px] resize-none"
            placeholder="e.g. Modern 2BHK with open kitchen, large windows for ventilation..."
          />
        </div>

        <div className="flex items-center bg-[#020617] p-4 rounded-[6px] border border-[#38BDF8]/30 shadow-sm">
          <input 
            type="checkbox" 
            id="vastu" 
            checked={vastu}
            onChange={(e) => setVastu(e.target.checked)}
            className="w-4 h-4 text-[#0EA5E9] border-[#0EA5E9] rounded focus:ring-[#0EA5E9] cursor-pointer"
          />
          <label htmlFor="vastu" className="ml-3 flex items-center cursor-pointer text-[13px] text-gray-200 font-medium">
            <Compass className="w-4 h-4 mr-2 text-[#0ea5e9]" />
            Enable Vastu Compliance (Indian Architectural Rules)
          </label>
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full bg-[#0EA5E9] text-white py-[14px] rounded-[8px] font-[700] hover:bg-[#0284C7] shadow-[0_4px_6px_-1px_rgba(14,165,233,0.2)] transition-colors mt-2 flex items-center justify-center"
        >
          GENERATE DESIGN
        </button>
      </div>
    </div>
  );
}
