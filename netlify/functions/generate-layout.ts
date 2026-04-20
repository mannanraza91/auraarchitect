import { GoogleGenAI, Type, Schema } from '@google/genai';

export const handler = async (event: any) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const body = JSON.parse(event.body);
  const { plotShape, width, backWidth, length, unit, floorsCount, requirements, vastu } = body;

  const prompt = `
You are a Principal Software Architect & Master Indian Architect.
We are building a production-grade house design SaaS called "Aura Architect".
Your task is to generate a fully personalized 2D floor plan JSON spanning ${floorsCount} floors.

Plot Characteristics:
- Shape Type: ${plotShape?.toUpperCase()} (Front Width: ${width}${unit}, Back Width: ${backWidth}${unit}, Total Length: ${length}${unit})
- Max Bounding Width: ${Math.max(width, backWidth)}
- Max Bounding Length: ${length}

User Requirements:
"${requirements}"

Vastu Compliant: ${vastu ? 'YES' : 'NO'}

CRITICAL INSTRUCTIONS:
1. Plot Outline & Shape: If the plot is UNEVEN (trapezoid), provide the exact 'outline' array in the 'plot' object representing the 4 corners: [{x:0, y:0}, {x:${width}, y:0}, {x:${width - (width-backWidth)/2}, y:${length}}, {x:${(width-backWidth)/2}, y:${length}}]. Adjust x-coordinates if aligned differently by user requirements. All rooms MUST fit strictly inside this polygon boundary.
2. Space Allocation: Provide exactly ${floorsCount} entries in the "floors" array. (Level 0 = Ground, 1 = First, etc).
3. Do NOT overlap any rooms!
4. Interlayer Alignment: Stair MUST occupy the same coordinates on every floor.
5. Provide realistic dimensions for rooms. 
6. Logical flow from Entrance/Gate -> Living/Hall -> Rooms.
7. Vastu Engine (If YES): North/East entrance, SE kitchen, SW Master Bed.
8. Doors: Provide realistic doors.
9. Interior Design Module: Style names, hex colors, and furniture descriptions.

Output strictly valid JSON.
`;

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
                  type: { type: Type.STRING, enum: ['living', 'bedroom', 'kitchen', 'bathroom', 'parking', 'garden', 'circulation', 'other'] },
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

    const text = response.text;
    if (!text) throw new Error("No layout generated.");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(JSON.parse(text)),
    };
  } catch (err: any) {
    console.error("Gemini Error:", err);
    const status = (err.message?.includes('429') || err.message?.includes('quota')) ? 429 : 500;
    return {
      statusCode: status,
      body: JSON.stringify({ 
        error: status === 429 ? "AI Quota Exceeded. Please try again later." : (err.message || "Failed to generate layout.") 
      }),
    };
  }
};
