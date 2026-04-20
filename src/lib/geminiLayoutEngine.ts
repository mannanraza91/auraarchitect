import { LayoutPlan } from '../store';

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
  try {
    const response = await fetch('/api/generate-layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plotShape,
        width,
        backWidth,
        length,
        unit,
        floorsCount,
        requirements,
        vastu
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json() as LayoutPlan;
  } catch (err: any) {
    console.error("Layout API Error:", err);
    throw new Error(err.message || "Failed to generate layout via secure server.");
  }
}
