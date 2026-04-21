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
You are a Principal Lead Architect. Generate a technically sound 2D floor plan JSON for ${floorsCount} floors.
Context: Plot ${width}x${length}${unit}, Road: ${roadPositions.join(', ')}, Vastu: ${vastu}.
Requirements: "${requirements}"
Output strictly robust JSON following the schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
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
    throw new Error(err.message || "Failed to generate layout.");
  }
}
