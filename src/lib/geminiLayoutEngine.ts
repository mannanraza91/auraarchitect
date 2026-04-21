import { LayoutPlan } from '../store';

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
  try {
    const response = await fetch('/api/generate-layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plotShape, width, backWidth, length, unit,
        floorsCount, requirements, vastu, northDirection,
        roadPositions, hasCommercial
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate layout via server.');
    }
    
    return await response.json() as LayoutPlan;
  } catch (err: any) {
    console.error("Layout Proxy Error:", err);
    throw new Error(err.message || "Failed to generate layout.");
  }
}
