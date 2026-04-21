import React, { useRef, useState } from 'react';
import { useAppStore, Room, Door } from '../store';

const getRoomColor = (type: string, isBW: boolean) => {
  if (isBW) {
    switch (type) {
      case 'living': return 'rgba(0, 0, 0, 0.05)';
      case 'bedroom': return 'rgba(0, 0, 0, 0.1)';
      case 'kitchen': return 'rgba(0, 0, 0, 0.15)';
      case 'bathroom': return 'rgba(0, 0, 0, 0.2)';
      case 'parking': return 'rgba(0, 0, 0, 0.03)';
      case 'garden': return 'rgba(0, 0, 0, 0.02)';
      case 'circulation': return 'rgba(0, 0, 0, 0.08)';
      default: return 'rgba(0, 0, 0, 0.05)';
    }
  }
  switch (type) {
    case 'living': return 'rgba(59, 130, 246, 0.4)'; // Blue
    case 'bedroom': return 'rgba(168, 85, 247, 0.4)'; // Purple
    case 'kitchen': return 'rgba(239, 68, 68, 0.4)'; // Red
    case 'bathroom': return 'rgba(14, 165, 233, 0.4)'; // Sky
    case 'parking': return 'rgba(107, 114, 128, 0.4)'; // Gray
    case 'garden': return 'rgba(34, 197, 94, 0.4)'; // Green
    case 'circulation': return 'rgba(234, 179, 8, 0.4)'; // Yellow
    default: return 'rgba(255, 255, 255, 0.2)';
  }
};

export function Plan2DView({ containerRef, theme = 'dark', forceFloor }: { containerRef?: React.RefObject<HTMLDivElement>, theme?: 'dark' | 'light' | 'bw', forceFloor?: number }) {
  const { layout, unit, activeFloor, northDirection, roadPositions, selectedElement } = useAppStore();
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  if (!layout) return null;

  const targetFloorLevel = forceFloor !== undefined ? forceFloor : activeFloor;
  const currentFloor = layout.floors.find(f => f.level === targetFloorLevel) || layout.floors[0];
  const { plot } = layout;
  const { rooms, doors } = currentFloor;

  const outline = plot.outline && plot.outline.length >= 3 
    ? plot.outline 
    : [{x: 0, y: 0}, {x: plot.width, y: 0}, {x: plot.width, y: plot.length}, {x: 0, y: plot.length}];

  const pointsStr = outline.map(p => `${p.x},${p.y}`).join(' ');

  // Let's decide a scale based on plot size to fit a ~600px square
  const maxDim = Math.max(plot.width, plot.length);
  const scale = 500 / maxDim; // 500px is the max internal coordinate constraint for SVG

  // Add 40 to svg width/height for margins & dimensions
  const svgWidth = plot.width * scale + 120; // Extra room for road labels
  const svgHeight = plot.length * scale + 120;

  const isLight = theme === 'light' || theme === 'bw';
  const isBW = theme === 'bw';

  const getNorthRotation = (dir: string) => {
    switch(dir) {
      case 'North': return 0;
      case 'East': return 90;
      case 'South': return 180;
      case 'West': return 270;
      default: return 0;
    }
  };

  // X moves left->right, Y moves bottom->top in our domain model, but SVG Y moves top->bottom.
  // We'll transform the group so Y=0 is bottom and Y=plot.length is top.
  return (
    <div className={`w-full flex justify-center items-center overflow-auto p-4 rounded-[12px] h-full relative ${isLight ? 'bg-transparent' : ''}`} ref={containerRef}>
      <svg 
        width={svgWidth} 
        height={svgHeight} 
        className={isLight ? '' : 'checkerboard'}
        style={{ touchAction: 'none' }}
      >
        <defs>
          <pattern id="grid" width={10} height={10} preserveAspectRatio="none" patternUnits="userSpaceOnUse">
             <path d="M 10 0 L 0 0 0 10" fill="none" stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)"} strokeWidth="0.5" />
          </pattern>
        </defs>
        
        {/* Road Indicators */}
        {roadPositions.includes('front') && (
           <g transform={`translate(${60 + (plot.width*scale)/2}, ${svgHeight - 10})`}>
              <text textAnchor="middle" fill={isBW ? "#000" : (isLight ? "#94A3B8" : "#38BDF8")} fontSize={9} fontWeight="900" className="uppercase tracking-[2px]">Primary Road Access</text>
              <line x1={-(plot.width*scale)/2} y1={-15} x2={(plot.width*scale)/2} y2={-15} stroke={isBW ? "#000" : (isLight ? "#94A3B8" : "#38BDF8")} strokeWidth={1} strokeDasharray="5,3" opacity={0.5} />
           </g>
        )}
        {roadPositions.includes('back') && (
           <g transform={`translate(${60 + (plot.width*scale)/2}, 25)`}>
              <text textAnchor="middle" fill={isBW ? "#000" : (isLight ? "#94A3B8" : "#38BDF8")} fontSize={9} fontWeight="900" className="uppercase tracking-[2px]">Rear Road</text>
              <line x1={-(plot.width*scale)/2} y1={15} x2={(plot.width*scale)/2} y2={15} stroke={isBW ? "#000" : (isLight ? "#94A3B8" : "#38BDF8")} strokeWidth={1} strokeDasharray="5,3" opacity={0.5} />
           </g>
        )}
        {roadPositions.includes('left') && (
           <g transform={`translate(25, ${60 + (plot.length*scale)/2}) rotate(-90)`}>
              <text textAnchor="middle" fill={isBW ? "#000" : (isLight ? "#94A3B8" : "#38BDF8")} fontSize={9} fontWeight="900" className="uppercase tracking-[2px]">Side Road</text>
              <line x1={-(plot.length*scale)/2} y1={12} x2={(plot.length*scale)/2} y2={12} stroke={isBW ? "#000" : (isLight ? "#94A3B8" : "#38BDF8")} strokeWidth={1} strokeDasharray="5,3" opacity={0.5} />
           </g>
        )}
        {roadPositions.includes('right') && (
           <g transform={`translate(${svgWidth - 25}, ${60 + (plot.length*scale)/2}) rotate(90)`}>
              <text textAnchor="middle" fill={isBW ? "#000" : (isLight ? "#94A3B8" : "#38BDF8")} fontSize={9} fontWeight="900" className="uppercase tracking-[2px]">Side Road</text>
              <line x1={-(plot.length*scale)/2} y1={12} x2={(plot.length*scale)/2} y2={12} stroke={isBW ? "#000" : (isLight ? "#94A3B8" : "#38BDF8")} strokeWidth={1} strokeDasharray="5,3" opacity={0.5} />
           </g>
        )}

        {/* North Arrow */}
        <g transform={`translate(${svgWidth - 40}, 40) rotate(${getNorthRotation(northDirection)})`}>
           <circle r="15" fill="none" stroke={isBW ? "#000" : (isLight ? "#1a1a1a" : "white")} strokeWidth="1" opacity="0.3" />
           <path d="M 0 -12 L 4 0 L -4 0 Z" fill={isBW ? "#000" : (isLight ? "#1a1a1a" : "#0EA5E9")} />
           <text y="-18" textAnchor="middle" fontSize="10" fontWeight="bold" fill={isBW ? "#000" : (isLight ? "#1a1a1a" : "white")}>N</text>
        </g>

        {/* We center the drawing area */}
        <g transform={`translate(60, ${plot.length * scale + 60}) scale(${scale}, -${scale})`}>
          <polygon points={pointsStr} fill="url(#grid)" stroke={isLight ? "#333" : "#00f0ff"} strokeWidth={2/scale} />
          
          {rooms.map((room: Room) => {
            const isHovered = hoveredRoom?.id === room.id;
            const isSelected = selectedElement?.type === 'room' && selectedElement.id === room.id;
            
            return (
              <g 
                key={room.id} 
                transform={`translate(${room.x}, ${room.y})`}
                onMouseEnter={() => setHoveredRoom(room)}
                onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredRoom(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  useAppStore.getState().setSelectedElement({ type: 'room', id: room.id, floorLevel: targetFloorLevel });
                }}
                className="cursor-pointer transition-all duration-200 ease-in-out"
                style={{
                  transformOrigin: `${room.width / 2}px ${room.length / 2}px`,
                  transform: isHovered || isSelected ? `translate(${room.x}px, ${room.y}px) scale(1.02)` : `translate(${room.x}px, ${room.y}px) scale(1)`
                }}
              >
                <rect 
                  width={room.width} 
                  height={room.length} 
                  fill={isHovered || isSelected ? getRoomColor(room.type, isBW).replace('0.4', '0.6') : getRoomColor(room.type, isBW)} 
                  stroke={isSelected ? "#0EA5E9" : (isHovered ? (isBW ? "#000" : (isLight ? "#000" : "#0EA5E9")) : (isLight ? "#666" : "white"))} 
                  strokeWidth={isSelected ? 4/scale : (isHovered ? 2/scale : 1/scale)} 
                />
                {/* Reset scale for text so it doesn't get squished and flipped */}
                <g transform={`translate(${room.width / 2}, ${room.length / 2}) scale(${1/scale}, -${1/scale})`}>
                  <text 
                    x="0" 
                    y="-10" 
                    textAnchor="middle" 
                    fill={isLight ? "#333" : "white"} 
                    fontSize="14" 
                    fontWeight="bold"
                    className="drop-shadow-md pointer-events-none"
                  >
                    {room.name}
                  </text>
                  <text 
                    x="0" 
                    y="10" 
                    textAnchor="middle" 
                    fill={isLight ? "#666" : "rgba(255,255,255,0.8)"} 
                    fontSize="12"
                    className="pointer-events-none"
                  >
                    {room.width}{unit} x {room.length}{unit}
                  </text>
                </g>
              </g>
            );
          })}

          {doors && doors.map((door: Door) => (
             <g key={door.id} transform={`translate(${door.x}, ${door.y})`}>
                <rect 
                  width={door.width} 
                  height={door.length} 
                  fill={isBW ? "rgba(0,0,0,0.5)" : "#fbbf24"} /* Amber door */
                  stroke={isBW ? "#000" : "#b45309"}
                  strokeWidth={0.5/scale}
                />
             </g>
          ))}
        </g>
        
        {/* Plot Dimensions Annotations */}
        {/* Width at bottom */}
        <text x={60 + (plot.width * scale)/2} y={svgHeight - 15 + (roadPositions.includes('front') ? -15 : 0)} textAnchor="middle" fill={isBW ? "#000" : (isLight ? "#333" : "#00f0ff")} fontSize={16} fontWeight="bold">
          {plot.width} {unit}
        </text>
        {/* Dash lines for width */}
        <line x1={60} y1={svgHeight-20} x2={60 + plot.width * scale} y2={svgHeight-20} stroke={isBW ? "#000" : (isLight ? "#333" : "#00f0ff")} strokeWidth={1} strokeDasharray="4,4" />
        
        {/* Length on left side (rotated) */}
        <g transform={`translate(20, ${60 + (plot.length * scale)/2}) rotate(-90)`}>
          <text x={0} y={0} textAnchor="middle" fill={isBW ? "#000" : (isLight ? "#333" : "#00f0ff")} fontSize={16} fontWeight="bold">
            {plot.length} {unit}
          </text>
        </g>
        <line x1={25} y1={60} x2={25} y2={60 + plot.length * scale} stroke={isBW ? "#000" : (isLight ? "#333" : "#00f0ff")} strokeWidth={1} strokeDasharray="4,4" />
      </svg>
      
      {/* Floating Tooltip */}
      {hoveredRoom && (
        <div 
          className="fixed z-50 pointer-events-none bg-[#020617]/90 backdrop-blur-md border border-[#0EA5E9]/50 rounded-lg p-3 shadow-xl transform -translate-x-1/2 -translate-y-[120%]"
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
        >
          <h4 className="text-[#38BDF8] font-bold text-[14px] uppercase tracking-wide m-0">{hoveredRoom.name}</h4>
          <p className="text-white text-[12px] m-0 mt-1">Dims: {hoveredRoom.width}{unit} x {hoveredRoom.length}{unit}</p>
          <p className="text-[#94A3B8] text-[10px] m-0 mt-1 uppercase mt-2">{hoveredRoom.type} Area</p>
        </div>
      )}
    </div>
  );
}
