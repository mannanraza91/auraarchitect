AI House Design Generator

AI House Design Generator is a scalable, AI-driven system for automated generation of residential 2D floor plans and 3D architectural layouts based on user-defined constraints and plot specifications. The platform combines large language models (LLMs), rule-based spatial planning, and structured geometry modeling to produce deterministic, buildable, and optimized house designs.

Features

LLM-based requirement parsing for converting unstructured user input into structured design constraints

Constraint-driven layout generation engine ensuring architectural validity

Unified 2D and 3D design pipeline with a single source of truth (layout JSON model)

Detailed dimension mapping including rooms, circulation space, utilities, and structural elements

Intelligent space optimization based on plot size and functional requirements

Optional Vastu-compliant layout adjustments based on directional rules

Extensible export system for generating professional PDF outputs (in progress)

How It Works

User Input → AI Parsing Layer → Constraint Engine → Layout Generation Engine → Geometry Model → 2D Rendering + 3D Visualization

Tech Stack

Frontend: Next.js (SSR-enabled, scalable UI architecture)

Backend: Node.js / Express (modular service-based architecture)

AI Layer: OpenAI + Gemini (hybrid multi-provider with fallback strategy)

3D Rendering: Three.js (WebGL-based real-time visualization)

Database: PostgreSQL / Supabase (structured data and state management)

Installation

npm install
npm start

Usage

Input plot dimensions or upload plot reference (future CV support)

Define requirements (rooms, parking, utilities, constraints)

Trigger layout generation pipeline

Visualize synchronized 2D floor plan and 3D model

Iterate or export design

Goal

To build a production-grade SaaS platform that automates residential planning through a hybrid AI + rule-based system, delivering fast, accurate, and construction-ready layouts while reducing dependency on manual architectural drafting.

Status

The system is under active development. Core modules including requirement parsing, constraint modeling, and layout generation are functional. Ongoing work includes 3D optimization, PDF export pipeline, and performance scaling.

Author

AI-based architectural design automation system under development as a scalable SaaS product.
