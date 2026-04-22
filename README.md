# Aura Architect

Aura Architect is an experimental SaaS application that explores the intersection of Large Language Models and constraint-based spatial planning. 

I built this to solve a specific challenge: getting an LLM to reliably generate deterministic, geometrically valid floor plans based on real-world architectural constraints (site orientation, road access, Vastu compliance, and minimum dimensional limits) without hallucinating impossible geometries. 

The application parses user requirements, acts as a rules engine via Gemini, and uses the resulting JSON as a single source of truth to render both 2D technical blueprints and interactive 3D models in real-time.

## System Architecture & Stack

I opted for a lightweight, frontend-heavy stack to keep the deployment serverless and heavily rely on client-side rendering.

- **Core & UI**: React 19, TypeScript, Vite, Tailwind CSS v4.
- **State Management**: Zustand (deliberately chosen to avoid Redux boilerplate for a localized state tree).
- **Graphics & Rendering**: 
  - **3D**: `Three.js` wrapped with `@react-three/fiber` and `drei`.
  - **2D**: Scalable Vector Graphics (SVG) driven directly by the layout coordinate state.
- **AI Integration**: Google GenAI SDK (`gemini-3-flash-preview` is currently preferred for its low latency and high reliability with structured JSON output).
- **Document Generation**: `jsPDF` and `html2canvas` for client-side compilation of multi-page technical architectures.

## Core Mechanics

1. **The Rules Engine**: The prompt engineering isn't just about text generation; it acts as an architectural compiler. It enforces a strict schema that accounts for 13 architectural pillars (e.g., vertical load alignment, ventilation, zoning) before outputting the layout payload.
2. **Synchronized Rendering**: Once the AI returns the layout matrix, both the 2D blueprint view and the 3D WebGL canvas consume the exact same state object. Interaction in the 3D space (like selecting a room) updates the shared state, triggering UI updates in the side panels for interior design recommendations.
3. **In-Browser Exporting**: To save on backend processing costs, complex multi-page PDF generation (including DOM-to-Canvas rasterization) is handled entirely in the browser's main thread.

## Local Development

### Prerequisites
- Node.js (v18+ recommended)
- A Google Gemini API Key

### Setup

1. Clone the repo and install dependencies:
```bash
git clone https://github.com/yourusername/aura-architect.git
cd aura-architect
npm install
