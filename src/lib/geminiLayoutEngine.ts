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
          description: "Precise boundary coordinates of the plot if the shape is irregular."
        }
      },
      required: ['width', 'length'],
    },
    floors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.NUMBER },
          name: { type: Type.STRING },
          rooms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                length: { type: Type.NUMBER },
                interior: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING },
                    colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    description: { type: Type.STRING }
                  },
                  required: ['style', 'colors', 'description']
                }
              },
              required: ['id', 'name', 'type', 'x', 'y', 'width', 'length', 'interior'],
            },
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
                isHorizontal: { type: Type.BOOLEAN },
              },
              required: ['id', 'x', 'y', 'width', 'length', 'isHorizontal'],
            },
          }
        },
        required: ['level', 'name', 'rooms', 'doors']
      }
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
You are a Principal Lead Architect & Master Urban Planner.
Your task is to generate a technically sound, buildable, and logically optimized 2D floor plan JSON for ${floorsCount} floors for "Aura Architect".

Site Context:
- Plot Shape: ${plotShape.toUpperCase()} (${width}${unit} x ${length}${unit}).
- Total Available Area: ${width * length} ${unit}².
- Orientation: North is at ${northDirection}.
- Road Access: Road(s) at ${roadPositions.join(', ')}.
- Constraints: Ensure 100% logical space utilization. ZERO dead spaces.

User Requirements:
"${requirements}"

Architectural Mandates for 100% Utilization:
1. MAXIMIZE CARPET AREA: Utilize the entire ${width}x${length} boundary. Avoid leaving empty "white space" or voids between rooms.
2. TIGHT PACKING & GEOMETRY: Rooms must be perfectly adjacent with zero-gap boundaries. Use a grid-based approach. If the plot width is ${width}, the sum of room widths in a horizontal line must exactly equal ${width}. 
3. COORDINATE CALCULATION: Ensure rooms are placed at exact integer coordinates that align. If Room A ends at x=15, Room B must start exactly at x=15.
4. LOGICAL ZONING: 
   - Public/Entry zones near the road.
   - Private/Bedrooms in quiet corners.
   - Services (Kitchen/Bath) clustered for plumbing efficiency.
5. CIRCULATION FLOW: Every room must be accessible through doors or hallways. (Circulation area counts as space utilization).
6. VASTU COMPLIANCE: ${vastu ? 'Strictly follow Vastu rules (e.g., NE entry, SE kitchen, SW master bed).' : 'Apply general functional logic.'}
7. STRUCTURAL ALIGNMENT: Walls on upper floors must align with ground floor supports.

Interior Design (Functional Recommendation):
For every room, specify style, hex colors, and a short description of the functional layout (e.g., "U-shaped kitchen counter to maximize workspace").

Output strictly valid, robust JSON following the provided schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json',
        responseSchema: layoutSchema,
        temperature: 0.1,
      },
    });

    if (!response.text) throw new Error("No layout generated.");
    return JSON.parse(response.text) as LayoutPlan;
  } catch (err: any) {
    console.error("Gemini Error:", err);
    
    // Handle Quota Exhausted specifically
    if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("AI Quota Exceeded. Please wait a minute or check your Gemini API limits at ai.google.dev. We've switched to a more efficient model to help mitigate this.");
    }
    
    throw new Error(err.message || "Failed to generate layout.");
  }
}
