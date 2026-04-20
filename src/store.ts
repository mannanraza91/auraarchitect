import { create } from 'zustand';

export type RoomType =
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'parking'
  | 'garden'
  | 'circulation'
  | 'other';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  x: number;
  y: number;
  width: number;
  length: number; // in y direction
  color?: string;
  interior?: {
    style: string;
    colors: string[];
    description: string;
  };
}

export interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  length: number;
  isHorizontal: boolean; // true if placed on a horizontal wall
}

export interface FloorPlan {
  level: number;
  name: string;
  rooms: Room[];
  doors: Door[];
}

export interface LayoutPlan {
  plot: {
    width: number;
    length: number;
    outline?: { x: number; y: number }[];
  };
  floors: FloorPlan[];
}

interface AppState {
  step: 'input' | 'generating' | 'results';
  plotShape: 'rectangular' | 'uneven';
  plotWidth: number;
  plotBackWidth: number; // For uneven shapes
  plotLength: number;
  floorsCount: number;
  unit: 'ft' | 'm';
  requirements: string;
  isVastuCompliant: boolean;
  layout: LayoutPlan | null;
  error: string | null;

  selectedElement: { type: 'room' | 'door', id: string, floorLevel: number } | null;
  baseCostPerSqFt: number;
  generationTimeMs: number;
  activeFloor: number;

  setStep: (step: AppState['step']) => void;
  setPlotShape: (shape: 'rectangular' | 'uneven') => void;
  setPlot: (width: number, length: number, backWidth: number, unit: AppState['unit']) => void;
  setFloorsCount: (count: number) => void;
  setRequirements: (req: string) => void;
  setVastuCompliant: (isCompliant: boolean) => void;
  setLayout: (layout: LayoutPlan, timeMs: number) => void;
  setError: (err: string | null) => void;
  setSelectedElement: (element: { type: 'room' | 'door', id: string, floorLevel: number } | null) => void;
  setBaseCostPerSqFt: (cost: number) => void;
  setActiveFloor: (floor: number) => void;
  updateDoorPosition: (floorLevel: number, id: string, x: number, y: number) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: 'input',
  plotShape: 'rectangular',
  plotWidth: 30,
  plotBackWidth: 30,
  plotLength: 40,
  floorsCount: 1,
  unit: 'ft',
  requirements: 'I want a modern multi-floor house setup with a smart living room, aesthetic bedroom, and modern kitchen.',
  isVastuCompliant: true,
  layout: null,
  error: null,
  selectedElement: null,
  baseCostPerSqFt: 2000,
  generationTimeMs: 0,
  activeFloor: 0,

  setStep: (step) => set({ step }),
  setPlotShape: (plotShape) => set({ plotShape }),
  setPlot: (width, length, backWidth, unit) => set({ plotWidth: width, plotLength: length, plotBackWidth: backWidth, unit }),
  setFloorsCount: (floorsCount) => set({ floorsCount }),
  setRequirements: (requirements) => set({ requirements }),
  setVastuCompliant: (isVastuCompliant) => set({ isVastuCompliant }),
  setLayout: (layout, timeMs) => set({ layout, generationTimeMs: timeMs }),
  setError: (error) => set({ error }),
  setSelectedElement: (selectedElement) => set({ selectedElement }),
  setBaseCostPerSqFt: (baseCostPerSqFt) => set({ baseCostPerSqFt }),
  setActiveFloor: (activeFloor) => set({ activeFloor, selectedElement: null }),
  
  updateDoorPosition: (floorLevel, id, x, y) => set((state) => {
    if (!state.layout) return state;
    const newFloors = state.layout.floors.map(floor => {
       if (floor.level === floorLevel) {
          const newDoors = floor.doors.map(d => d.id === id ? { ...d, x, y } : d);
          return { ...floor, doors: newDoors };
       }
       return floor;
    });
    return { layout: { ...state.layout, floors: newFloors } };
  }),

  reset: () =>
    set({
      step: 'input',
      layout: null,
      error: null,
      selectedElement: null,
    }),
}));
