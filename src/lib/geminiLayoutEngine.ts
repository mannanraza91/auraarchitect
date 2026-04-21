import { GoogleGenAI, Type, Schema } from '@google/genai';
import { LayoutPlan } from '../store';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const layoutSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    plot: {
      type: Type.OBJECT,
      properties: {
        width: { type: Type.NUMBER },
        length: { type: Type.NUMBER },
        outline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
            },
            required: ['x', 'y'],
          },
          description: "Precise boundary coordinates of the plot if the shape is irregular. Usually an array of 4 points starting from bottom-left (0,0) going counter-clockwise."
        }
      },
      required: ['width', 'length'],
    },
    floors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.NUMBER, description: 'Floor level (0 for ground, 1 for first flow, etc.)' },
          name: { type: Type.STRING, description: 'e.g. Ground Floor, First Floor' },
          rooms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['living', 'bedroom', 'kitchen', 'bathroom', 'parking', 'garden', 'circulation', 'other'] },
                x: { type: Type.NUMBER, description: 'bottom-left X coordinate' },
                y: { type: Type.NUMBER, description: 'bottom-left Y coordinate' },
                width: { type: Type.NUMBER, description: 'width along X axis' },
                length: { type: Type.NUMBER, description: 'length along Y axis' },
                interior: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING, description: 'Interior design style (e.g. Modern Minimalist, Traditional)' },
                    colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Hex color codes for the theme' },
                    description: { type: Type.STRING, description: 'Detailed recommendation for furniture, layout and aesthetics' }
                  },
                  required: ['style', 'colors', 'description']
                }
              },
              required: ['id', 'name', 'type', 'x', 'y', 'width', 'length', 'interior'],
            },
            description: "Array of non-overlapping rooms packed perfectly into the plot for this floor. The layout should be functionally logical.",
          },
          doors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                length: { type: Type.NUMBER },
                isHorizontal: { type: Type.BOOLEAN, description: 'True if along X axis wall, False if along Y axis wall' },
              },
              required: ['id', 'x', 'y', 'width', 'length', 'isHorizontal'],
            },
            description: "Doors connecting the rooms or leading outside. Keep sizes realistic (e.g. 3ft width).",
          }
        },
        required: ['level', 'name', 'rooms', 'doors']
      },
      description: "Array of floors with exactly one object per floor level."
    }
  },
  required: ['plot', 'floors'],
};

export async function generateHouseLayout(
  plotShape: string,
  width: number,
  backWidth: number,
  length: number,
  unit: string,
  floorsCount: number,
  requirements: string,
  vastu: boolean,
  northDirection: string,
  roadPositions: string[],
  hasCommercial: boolean
): Promise<LayoutPlan> {
  const prompt = `
You are a Principal Lead Architect & Master Planner. You are NOT just a layout generator; you are a PROFESSIONAL ARCHITECT.
Your task is to generate a technically sound, buildable, and highly functional 2D floor plan JSON spanning ${floorsCount} floors for the SaaS "Aura Architect".

Site Context (Foundation):
- Plot Shape: ${plotShape.toUpperCase()} (Front Width: ${width}${unit}, Back Width: ${backWidth}${unit}, Total Length: ${length}${unit})
- Orientation: The plot's NORTH direction is facing ${northDirection}.
- Road Access: Road(s) are located at: ${roadPositions.join(', ')}.
- Use Case: ${hasCommercial ? 'Mixed Use (Commercial Ground/Entry + Residential)' : 'Residential Only'}.

User Vision:
"${requirements}"

Professional Architectural Principles (The 13 Pillars):
1. SITE UNDERSTANDING: Prioritize road orientation and North-based sunlight.
2. SPACE PLANNING: Logic zones (Public vs Private).
3. PRACTICAL DIMENSIONS: No "unusable" tiny rooms. Bedrooms min 10x12ft. Kitchens min 8x10ft.
4. VENTILATION: Every habitable room MUST have outside facing windows.
5. STRUCTURAL FEASIBILITY: Align major walls vertically across all levels.
6. CIRCULATION: Smooth paths; ZERO dead ends.
7. PARKING & ENTRY: Clear vehicle access.
8. ORIENTATION (Vastu: ${vastu ? 'STRICT' : 'OPTIONAL'}): Master Bed SW, Kitchen SE, etc.
9. OPTIMIZATION: Maximize usable carpet area.
10. BYE-LAWS: Enforce setbacks (3-5ft if plot > 1500 sq ft).
11. AESTHETICS: Geometric balance.
12. SERVICES: Stacking plumbing zones.
13. FUTURE EXPANSION: Logical stair placement.

CRITICAL: Interior Design must be "PROPER FUNCTIONING".
For each room, the 'interior.description' MUST explicitly detail:
1. DIMENSION: Exact size relevance for its purpose.
2. WORKING: How people move and work in the space (e.g., kitchen work triangle, bedroom circulation).
3. PURPOSE: The primary and secondary usage of the space.

Output strictly robust, valid, and minified JSON conforming perfectly to the schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json',
        responseSchema: layoutSchema,
        temperature: 0.1, // Low temp for more precise/robotic geometric output
      },
    });

    const text = response.text;
    if (!text) throw new Error("No layout generated.");
    
    return JSON.parse(text) as LayoutPlan;
  } catch (err: any) {
    console.error("Gemini Generation Error:", err);
    throw new Error(err.message || "Failed to generate layout.");
  }
}
