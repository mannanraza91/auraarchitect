import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/generate-layout', async (req, res) => {
    try {
      const { 
        plotShape, width, backWidth, length, unit, 
        floorsCount, requirements, vastu, northDirection, 
        roadPositions, hasCommercial 
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not valid or not configured on the server. Please ensure you have set it in the Secrets panel.' 
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const layoutSchema = {
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
                  }
                }
              },
              required: ['level', 'name', 'rooms', 'doors']
            }
          }
        },
        required: ['plot', 'floors'],
      };

      const prompt = `
You are a Principal Lead Architect & Master Planner.
Your task is to generate a technically sound, buildable, and highly functional 2D floor plan JSON spanning ${floorsCount} floors for the SaaS "Aura Architect".

Site Context:
- Plot Shape: ${plotShape.toUpperCase()} (Front Width: ${width}${unit}, Back Width: ${backWidth}${unit}, Total Length: ${length}${unit})
- Orientation: The plot's NORTH direction is facing ${northDirection}.
- Road Access: Road(s) are located at: ${roadPositions.join(', ')}.
- Use Case: ${hasCommercial ? 'Mixed Use' : 'Residential Only'}.

User Vision:
"${requirements}"

Professional Architectural Principles:
1. SITE UNDERSTANDING: Prioritize road orientation and North-based sunlight.
2. SPACE PLANNING: Logic zones (Public vs Private).
3. PRACTICAL DIMENSIONS: No "unusable" tiny rooms.
4. VENTILATION: Every habitable room MUST have outside facing windows.
5. STRUCTURAL FEASIBILITY: Align major walls vertically.
6. CIRCULATION: Smooth paths.
8. ORIENTATION (Vastu: ${vastu ? 'STRICT' : 'OPTIONAL'}).

CRITICAL: Interior Design must be "PROPER FUNCTIONING".
For each room, the 'interior.description' MUST explicitly detail:
1. DIMENSION: Exact size relevance.
2. WORKING: How people move/work.
3. PURPOSE: Primary and secondary usage.

Output strictly robust, valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [prompt],
        config: {
          responseMimeType: 'application/json',
          responseSchema: layoutSchema,
          temperature: 0.1,
        },
      });

      if (!response.text) throw new Error('AI failed to generate a response');
      
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error('API Error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
