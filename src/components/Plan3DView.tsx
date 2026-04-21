import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Edges, TransformControls, Text, Html } from '@react-three/drei';
import { useAppStore, Room, Door } from '../store';
import * as THREE from 'three';

const getRoomColor3D = (type: string) => {
  switch (type) {
    case 'living': return '#3b82f6';
    case 'bedroom': return '#a855f7';
    case 'kitchen': return '#ef4444';
    case 'bathroom': return '#0ea5e9';
    case 'parking': return '#6b7280';
    case 'garden': return '#22c55e';
    case 'circulation': return '#eab308';
    default: return '#cccccc';
  }
};

const WALL_HEIGHT = 10; // 10 ft walls typically
const WALL_THICKNESS = 0.5;

function RoomModel({ room, floorLevel }: { room: Room, floorLevel: number }) {
  const { selectedElement, setSelectedElement } = useAppStore();
  const [hovered, setHovered] = React.useState(false);
  const isSelected = selectedElement?.type === 'room' && selectedElement.id === room.id && selectedElement.floorLevel === floorLevel;

  const cx = room.x + room.width / 2;
  const cz = room.y + room.length / 2;

  return (
    <group 
      position={[cx, 0, cz]} 
      onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'room', id: room.id, floorLevel }); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {hovered && (
         <Html position={[0, WALL_HEIGHT, 0]} center className="pointer-events-none">
           <div className="bg-[#020617]/90 backdrop-blur-md border border-[#0EA5E9]/50 rounded-lg p-3 shadow-xl w-max">
             <h4 className="text-[#38BDF8] font-bold text-[14px] uppercase tracking-wide m-0">{room.name}</h4>
             <p className="text-white text-[12px] m-0 mt-1">Dims: {room.width} x {room.length}</p>
             <p className="text-[#94A3B8] text-[10px] m-0 mt-1 uppercase mt-2">{room.type} Area</p>
           </div>
         </Html>
      )}

      {/* Translucent Floor */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width, room.length]} />
        <meshStandardMaterial 
          color={getRoomColor3D(room.type)} 
          opacity={isSelected ? 0.85 : 0.55} 
          transparent 
          roughness={0.1}
          metalness={0.2}
          emissive={isSelected ? getRoomColor3D(room.type) : 'black'} 
          emissiveIntensity={isSelected ? 0.5 : 0} 
        />
      </mesh>
      
      {/* Translucent Walls */}
      {/* North Wall */}
      <mesh position={[0, WALL_HEIGHT / 2, -room.length / 2]}>
        <boxGeometry args={[room.width, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.45} roughness={0} metalness={0.1} />
        <Edges scale={1.001} threshold={15} color={isSelected ? "#0EA5E9" : "#94A3B8"} transparent opacity={0.5} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, WALL_HEIGHT / 2, room.length / 2]}>
        <boxGeometry args={[room.width, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.45} roughness={0} metalness={0.1} />
        <Edges scale={1.001} threshold={15} color={isSelected ? "#0EA5E9" : "#94A3B8"} transparent opacity={0.5} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-room.width / 2, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, room.length]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.45} roughness={0} metalness={0.1} />
        <Edges scale={1.001} threshold={15} color={isSelected ? "#0EA5E9" : "#94A3B8"} transparent opacity={0.5} />
      </mesh>
      {/* East Wall */}
      <mesh position={[room.width / 2, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, room.length]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.45} roughness={0} metalness={0.1} />
        <Edges scale={1.001} threshold={15} color={isSelected ? "#0EA5E9" : "#94A3B8"} transparent opacity={0.5} />
      </mesh>
      
      {/* Furniture Procedural Mockups */}
      {room.type === 'living' && (
         <group position={[0, 0.5, 0]}>
            <mesh position={[0, 1, -room.length/4]}><boxGeometry args={[room.width * 0.4, 2, room.length * 0.2]} /><meshStandardMaterial color="#334155" /></mesh>
            <mesh position={[0, 2, room.length/2 - 1]}><boxGeometry args={[room.width * 0.3, 3, 0.5]} /><meshStandardMaterial color="#000000" emissive="#1e40af" emissiveIntensity={0.2} /></mesh>
         </group>
      )}
      {room.type === 'bedroom' && (
         <group position={[0, 0.5, 0]}>
            <mesh position={[0, 1, -room.length/4]}><boxGeometry args={[5, 2, 6]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
            <mesh position={[0, 2, -room.length/4 - 2.5]}><boxGeometry args={[5, 3, 0.5]} /><meshStandardMaterial color="#64748b" /></mesh>
         </group>
      )}
      {room.type === 'kitchen' && (
         <group position={[0, 0.5, 0]}>
            <mesh position={[-room.width/2 + 2, 1.5, 0]}><boxGeometry args={[3, 3, room.length * 0.6]} /><meshStandardMaterial color="#94a3b8" /></mesh>
         </group>
      )}
      {room.type === 'circulation' && (
         <group position={[0, 0.5, 0]}>
            {/* Simple stairs representation */}
            {[0,1,2,3,4].map(i => (
              <mesh key={i} position={[0, i*0.8, -room.length/2 + i*1.2 + 1]}>
                <boxGeometry args={[3, 0.5, 1]} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
            ))}
         </group>
      )}

      {/* 3D Label */}
      <Text
        position={[0, WALL_HEIGHT + 1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.5}
        color={isSelected ? "#0EA5E9" : "white"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="black"
      >
        {`${room.name}\n${room.width}x${room.length}`}
      </Text>
    </group>
  );
}

function DoorModel({ door, floorLevel }: { door: Door, floorLevel: number }) {
  const { selectedElement, setSelectedElement, updateDoorPosition } = useAppStore();
  const [hovered, setHovered] = React.useState(false);
  const isSelected = selectedElement?.type === 'door' && selectedElement.id === door.id && selectedElement.floorLevel === floorLevel;
  const cx = door.x + door.width / 2;
  const cz = door.y + door.length / 2;
  const doorHeight = 7;

  const meshRef = React.useRef<THREE.Mesh>(null);

  return (
    <>
      <mesh 
        ref={meshRef}
        position={[cx, doorHeight / 2, cz]}
        onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'door', id: door.id, floorLevel }); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[door.width + 0.1, doorHeight, door.length + 0.1]} />
        <meshStandardMaterial color={isSelected ? "#f59e0b" : hovered ? "#fde68a" : "#fbbf24"} emissive={isSelected || hovered ? "#f59e0b" : "black"} emissiveIntensity={isSelected || hovered ? 0.5 : 0} />
      </mesh>
      {isSelected && meshRef.current && (
        <TransformControls 
          object={meshRef.current as any} 
          mode="translate" 
          showY={false} 
          onMouseUp={(e) => {
             if (meshRef.current) {
                // Determine new bottom-left coordinate of the door
                const newX = meshRef.current.position.x - door.width / 2;
                const newZ = meshRef.current.position.z - door.length / 2;
                updateDoorPosition(floorLevel, door.id, newX, newZ);
             }
          }}
        />
      )}
    </>
  );
}

export function Plan3DView() {
  const { layout, activeFloor } = useAppStore();
  if (!layout) return null;

  const currentFloor = layout.floors.find(f => f.level === activeFloor) || layout.floors[0];
  const { plot } = layout;
  const { rooms, doors } = currentFloor;

  const outline = plot.outline && plot.outline.length >= 3 
    ? plot.outline 
    : [{x: 0, y: 0}, {x: plot.width, y: 0}, {x: plot.width, y: plot.length}, {x: 0, y: plot.length}];

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (outline.length > 0) {
       s.moveTo(outline[0].x, -outline[0].y);
       for(let i=1; i<outline.length; i++) {
         s.lineTo(outline[i].x, -outline[i].y);
       }
       s.lineTo(outline[0].x, -outline[0].y);
    }
    return s;
  }, [outline]);

  // Center coordinate of plot for camera focus
  const plotCx = plot.width / 2;
  const plotCz = plot.length / 2;

  // Since ThreeJS puts Z towards viewer and negative Z into screen and Y is up.
  // SVG has Y bottom to top. 
  // Let X = x, Z = y.
  // We shift by -plotCx and -plotCz to center the model at origin.

  return (
    <div className="w-full h-full bg-transparent overflow-hidden relative cursor-move rounded-[12px]">
      <Canvas camera={{ position: [0, 40, Math.max(plot.width, plot.length)], fov: 50 }} style={{ height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        
        <group position={[-plotCx, 0, -plotCz]} onPointerMissed={() => useAppStore.getState().setSelectedElement(null)}>
          {/* Ground Plane (Plot footprint) */}
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <shapeGeometry args={[shape]} />
             <meshStandardMaterial color="#1f2937" />
          </mesh>
          <Grid position={[plotCx, 0, plotCz]} args={[Math.max(plot.width, plot.length)*2, Math.max(plot.width, plot.length)*2]} cellColor="#374151" sectionColor="#00f0ff" cellThickness={1} sectionThickness={2} />

          {rooms.map(room => (
            <RoomModel key={room.id} room={room} floorLevel={currentFloor.level} />
          ))}

          {doors && doors.map(door => (
            <DoorModel key={door.id} door={door} floorLevel={currentFloor.level} />
          ))}
        </group>

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.1} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
