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
  vastu: boolean
): Promise<LayoutPlan> {
  const prompt = `
You are a Principal Software Architect & Master Indian Architect.
We are building a production-grade house design SaaS called "Aura Architect".
Your task is to generate a fully personalized 2D floor plan JSON spanning ${floorsCount} floors.

Plot Characteristics:
- Shape Type: ${plotShape.toUpperCase()} (Front Width: ${width}${unit}, Back Width: ${backWidth}${unit}, Total Length: ${length}${unit})
- Max Bounding Width: ${Math.max(width, backWidth)}
- Max Bounding Length: ${length}

User Requirements:
"${requirements}"

Vastu Compliant: ${vastu ? 'YES' : 'NO'}

CRITICAL INSTRUCTIONS:
1. Plot Outline & Shape: If the plot is UNEVEN (trapezoid), provide the exact 'outline' array in the 'plot' object representing the 4 corners: [{x:0, y:0}, {x:${width}, y:0}, {x:${width - (width-backWidth)/2}, y:${length}}, {x:${(width-backWidth)/2}, y:${length}}]. Adjust x-coordinates if aligned differently by user requirements. All rooms MUST fit strictly inside this polygon boundary.
2. Space Allocation: Provide exactly ${floorsCount} entries in the "floors" array. (Level 0 = Ground, 1 = First, etc).
3. Do NOT overlap any rooms! The \`(x, y)\` is the bottom-left corner of the room.
4. Interlayer Alignment: If building multiple floors, include a 'circulation' room for stairs. The stairs MUST occupy the EXACT same x, y, width, length coordinates on every floor.
5. Provide realistic dimensions for rooms. Ensure ground floor has parking if required.
6. Alignment Engine: Ensure a logical flow from Entrance/Gate -> Living/Hall -> Rooms. Avoid long empty corridors.
7. Vastu Engine (If YES): 
   - Entrance typically North or East.
   - Kitchen typically South-East.
   - Master Bedroom typically South-West.
   - Bathrooms typically North-West or South.
8. Doors: Provide realistic doors.
9. Interior Design Module: The schema requires an 'interior' object for EVERY room containing explicit style names, realistic hex code color palettes, and descriptive layout ideas with furniture (e.g., tv, sofa, slab, counters, etc.).

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
