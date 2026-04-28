# Aura Architect

Aura Architect is an experimental SaaS application that explores the intersection of Large Language Models and constraint-based spatial planning.

**This entire application—from the WebGL rendering engine to the state management and UI—was architected and written 100% by Google's Gemini 3.1 Pro using the Gemini API.**

It was built to solve a specific challenge: getting an LLM to reliably generate deterministic, geometrically valid floor plans based on real-world architectural constraints (site orientation, road access, Vastu compliance, and minimum dimensional limits) without hallucinating impossible geometries.

## Extended System Overview & Technical Deep Dive

At its core, spatial planning is a Constraint Satisfaction Problem (CSP). Historically, LLMs are excellent at semantic relationships ("the kitchen should be adjacent to the dining room") but notoriously bad at math and strict Cartesian coordinate generation ("generate non-overlapping rectangles within a 50x100 bounding box").

To bridge this gap, Aura Architect does not treat the LLM as a pure math solver. Instead, it treats the LLM as a **heuristic layout generator**.

### 1. Structured Output & The Architectural Prompt
The backend logic utilizes the **Gemini 3.1 Pro API** via the Google GenAI SDK, enforcing a strict JSON Schema definition. The prompt acts as a compiler, passing in the user's natural language alongside hard constraints (plot dimensions, active road frontages). By forcing the model to define exact `x`, `y`, `width`, and `length` properties for every room and door, we coerce the LLM into generating an abstract syntax tree (AST) of the building. We have meticulously tuned the prompt to enforce **100% space utilization** and tight geometric packing of rooms.

### 2. State Synchronization Pipeline
Once the JSON payload is parsed and validated, it becomes the single source of truth in our Zustand store. Because the reasoning engine is decoupled from the rendering pipeline, the exact same coordinate data is fed into two entirely different visualization contexts:
- **2D Engine**: A raw SVG implementation that maps the coordinates directly to viewport units, generating a scalable, technical blueprint view.
- **3D Engine**: WebGL driven by `Three.js` and `@react-three/fiber`. The React lifecycle declaratively maps the JSON array into extruded 3D meshes (walls, floors, doorways), automatically configuring materials without writing imperative Three.js boilerplate.

### 3. Rendering Escapes & PDF Generation
Generating high-fidelity, multi-page PDFs client-side without a headless browser backend (like Puppeteer) is tricky. This app leverages `jsPDF` and `html2canvas` to rasterize the DOM. A significant hurdle during development was DOM-to-Canvas libraries failing to parse modern CSS specs (like Tailwind v4's native `oklch` colors). The solution engineered by Gemini required overriding the styling engine to force standard hex serialization during the print render cycle to ensure professional document outputs.

## System Architecture & Stack

Opting for a lightweight, frontend-heavy stack keeps the deployment serverless and heavily reliant on client-side rendering.

- **AI Developer**: Gemini 3.1 Pro (100% Code Generation)
- **Engine**: Gemini 3.1 Pro API
- **Core & UI**: React 19, TypeScript, Vite, Tailwind CSS v4.
- **State Management**: Zustand (deliberately chosen to avoid Context API re-render cascades and Redux boilerplate).
- **Graphics & Rendering**:
  - **3D**: `Three.js` wrapped with `@react-three/fiber` and `drei`.
  - **2D**: Scalable Vector Graphics (SVG).
- **AI Integration**: Google GenAI SDK.
- **Document Generation**: `jsPDF` and `html2canvas`.

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
```

2. Set up your environment variables.
Create a `.env` file in the project root. **Do not commit this file.**
```env
GEMINI_API_KEY=your_actual_api_key_here
```

3. Spin up the Vite development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## Deployment

This app is structurally a Single Page Application (SPA) and is ready to be deployed to Vercel, Netlify, or any standard static host.

If deploying to Netlify/Vercel:
1. Set the Build Command to `npm run build`.
2. Set the Publish Directory to `dist`.
3. Inject the `GEMINI_API_KEY` into your host's secure environment variables dashboard so the runtime environment can process queries via the Gemini API.

## Known Limitations & Roadmap

- **Model Latency**: Generating a multi-story JSON matrix takes a few seconds.
- **Collision Detection**: While the prompt strongly discourages overlapping geometries, adding a strict mathematical collision detection pass on the client side before rendering would make the system bulletproof against LLM edge-case hallucinations.
- **Server-Side API Proxying**: For enterprise-grade security, the direct client-to-Gemini requests should ideally be wrapped in a serverless function endpoint to fully obfuscate the API key and enforce stricter rate limiting.

## License

MIT License. See [LICENSE](LICENSE) for details. Feel free to fork, break, and submit PRs.

---
*Maintained by Mannan Raza | Built entirely with Gemini 3.1 Pro and the Gemini API*
