import React, { useState } from 'react';
import { useAppStore } from '../store';
import { generateHouseLayout } from '../lib/geminiLayoutEngine';
import { Compass, Settings2, Sparkles, Building } from 'lucide-react';

export function InputStep() {
  const { 
    plotShape, plotWidth, plotBackWidth, plotLength, floorsCount, unit, requirements, isVastuCompliant, 
    northDirection, roadPositions, hasCommercialSpace,
    setPlotShape, setPlot, setFloorsCount, setRequirements, setVastuCompliant, 
    setNorthDirection, setRoadPositions, setCommercialSpace,
    setStep, setLayout, setError 
  } = useAppStore();
  
  const [shape, setShapeUI] = useState(plotShape);
  const [w, setW] = useState(plotWidth.toString());
  const [bw, setBw] = useState(plotBackWidth.toString());
  const [l, setL] = useState(plotLength.toString());
  const [f, setF] = useState(floorsCount.toString());
  const [u, setU] = useState<typeof unit>(unit);
  const [req, setReq] = useState(requirements);
  const [vastu, setVastu] = useState(isVastuCompliant);
  const [north, setNorth] = useState(northDirection);
  const [roads, setRoads] = useState<typeof roadPositions>(roadPositions);
  const [comm, setComm] = useState(hasCommercialSpace);
  
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
    if (roads.length === 0) {
      alert("Please specify at least one road position for site access.");
      return;
    }
    
    setPlotShape(shape);
    setPlot(nw, nl, nbw, u);
    setFloorsCount(nf);
    setRequirements(req);
    setVastuCompliant(vastu);
    setNorthDirection(north);
    setRoadPositions(roads);
    setCommercialSpace(comm);
    setStep('generating');
    setError(null);
    
    const startTime = Date.now();
    try {
      const layoutPlan = await generateHouseLayout(shape, nw, nbw, nl, u, nf, req, vastu, north, roads, comm);
      const timeMs = Date.now() - startTime;
      setLayout(layoutPlan, timeMs);
      setStep('results');
    } catch (err: any) {
      setStep('input');
      setError(err.message || 'Failed to generate layout.');
    }
  };

  const toggleRoad = (road: 'front' | 'back' | 'left' | 'right') => {
    if (roads.includes(road)) {
      setRoads(roads.filter(r => r !== road));
    } else {
      setRoads([...roads, road]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 my-4 w-full z-10 relative">
      <div className="glass-panel-dark p-8 rounded-2xl flex flex-col gap-6 shadow-2xl">
        
        <div className="flex justify-between items-center mb-2">
           <h2 className="text-[14px] uppercase font-[800] text-[#0EA5E9] tracking-[2px] flex items-center">
            <Building className="mr-3 w-5 h-5" /> 1. Plot Geography
          </h2>
          <div className="flex items-center gap-2 bg-[#020617] px-3 py-1.5 rounded-md border border-[#334155]">
             <span className="text-[10px] uppercase font-bold text-[#64748B]">Units:</span>
             <select 
                value={u} 
                onChange={(e) => setU(e.target.value as any)}
                className="bg-transparent text-[12px] text-white focus:outline-none font-bold"
              >
                <option value="ft">FT</option>
                <option value="m">M</option>
              </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-full bg-[#020617] p-1.5 rounded-xl flex gap-2 border border-[#334155]">
            <button 
              className={`flex-1 py-3 text-[12px] font-[800] rounded-lg transition-all uppercase tracking-wider ${shape === 'rectangular' ? 'bg-[#0EA5E9] text-white shadow-lg' : 'text-[#64748B] hover:text-white hover:bg-white/5'}`}
              onClick={() => setShapeUI('rectangular')}
            >
              Rectangular
            </button>
            <button 
              className={`flex-1 py-3 text-[12px] font-[800] rounded-lg transition-all uppercase tracking-wider ${shape === 'uneven' ? 'bg-[#0EA5E9] text-white shadow-lg' : 'text-[#64748B] hover:text-white hover:bg-white/5'}`}
              onClick={() => setShapeUI('uneven')}
            >
              Irregular Plot
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-[800] uppercase text-[#94A3B8] tracking-widest">
              {shape === 'uneven' ? 'Front Width' : 'Width'}
            </label>
            <input 
              type="number" 
              value={w} 
              onChange={(e) => setW(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all font-mono"
              placeholder="30"
            />
          </div>
          {shape === 'uneven' && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-[800] uppercase text-[#94A3B8] tracking-widest">Back Width</label>
              <input 
                type="number" 
                value={bw} 
                onChange={(e) => setBw(e.target.value)}
                className="w-full bg-[#020617] border border-[#334155] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all font-mono"
                placeholder="25"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-[800] uppercase text-[#94A3B8] tracking-widest">Length</label>
            <input 
              type="number" 
              value={l} 
              onChange={(e) => setL(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all font-mono"
              placeholder="40"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-[800] uppercase text-[#94A3B8] tracking-widest">Storeys</label>
            <select 
              value={f} 
              onChange={(e) => setF(e.target.value)}
              className="w-full bg-[#020617] border border-[#334155] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all font-bold"
            >
              <option value="1">Ground Only</option>
              <option value="2">G + 1 Floor</option>
              <option value="3">G + 2 Floors</option>
              <option value="4">G + 3 Floors</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
           <div>
              <h3 className="text-[14px] uppercase font-[800] text-[#0EA5E9] tracking-[2px] mb-4 flex items-center">
                <Compass className="mr-3 w-5 h-5" /> 2. Site Orientation
              </h3>
              <div className="flex flex-col gap-4 bg-[#020617] p-6 rounded-xl border border-[#334155]">
                 <div>
                    <label className="text-[10px] font-[800] uppercase text-[#94A3B8] mb-3 block tracking-widest">North Direction (Facing)</label>
                    <div className="flex gap-2">
                       {['North', 'South', 'East', 'West'].map((dir) => (
                         <button 
                            key={dir}
                            onClick={() => setNorth(dir as any)}
                            className={`flex-1 py-2 text-[11px] font-bold rounded-lg border transition-all ${north === dir ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'bg-transparent text-gray-500 border-[#334155] hover:text-white'}`}
                         >
                            {dir.toUpperCase()}
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-[800] uppercase text-[#94A3B8] mb-3 block tracking-widest">Road Positions (Site Access)</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['front', 'back', 'left', 'right'].map((pos) => (
                         <button 
                            key={pos}
                            onClick={() => toggleRoad(pos as any)}
                            className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${roads.includes(pos as any) ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/50' : 'bg-transparent text-gray-500 border-[#334155] hover:text-white'}`}
                         >
                            {pos.toUpperCase()} ROAD
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div>
              <h3 className="text-[14px] uppercase font-[800] text-[#0EA5E9] tracking-[2px] mb-4 flex items-center">
                <Settings2 className="mr-3 w-5 h-5" /> 3. Functional Needs
              </h3>
              <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-[800] uppercase text-[#94A3B8] tracking-widest">Architectural Requirements</label>
                    <textarea 
                      value={req}
                      onChange={(e) => setReq(e.target.value)}
                      className="w-full bg-[#020617] border border-[#334155] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] h-[105px] resize-none leading-relaxed"
                      placeholder="Describe logical room placements, private/public zones, or specific architectural needs..."
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-[#020617] p-3 rounded-xl border border-[#334155]">
                        <label htmlFor="vastu" className="flex items-center cursor-pointer text-[12px] text-gray-300 font-bold uppercase tracking-wider">
                          Vastu Compliant
                        </label>
                        <input 
                          type="checkbox" 
                          id="vastu" 
                          checked={vastu}
                          onChange={(e) => setVastu(e.target.checked)}
                          className="w-5 h-5 text-[#0EA5E9] bg-transparent border-[#334155] rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                    </div>
                    <div className="flex items-center justify-between bg-[#020617] p-3 rounded-xl border border-[#334155]">
                        <label htmlFor="comm" className="flex items-center cursor-pointer text-[12px] text-gray-300 font-bold uppercase tracking-wider">
                          Commercial Ground Entry
                        </label>
                        <input 
                          type="checkbox" 
                          id="comm" 
                          checked={comm}
                          onChange={(e) => setComm(e.target.checked)}
                          className="w-5 h-5 text-[#38BDF8] bg-transparent border-[#334155] rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full bg-[#0EA5E9] text-white py-4 rounded-xl font-[900] text-[14px] uppercase tracking-[3px] hover:bg-[#0284C7] shadow-[0_10px_30px_-10px_rgba(14,165,233,0.5)] transition-all mt-4 flex items-center justify-center group overflow-hidden relative"
        >
          <span className="relative z-10 flex items-center gap-2">
            Compute Architectural Layout <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>
    </div>
  );
}
