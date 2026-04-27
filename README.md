# Wumpus World Agent - Tech Stack & Architecture

This document provides a comprehensive overview of the technologies, libraries, and architectural patterns used to build the Wumpus World Logic Agent Simulator.

## 1. Core Framework & Build Tools

### **React 18**
* **Purpose**: Core library for building the user interface.
* **Usage in Project**:
  * **Component Architecture**: Breaking down the UI into reusable pieces (`GridRenderer`, `SetupPanel`, `MetricsDashboard`, `KBPanel`, `PerceptLogPanel`).
  * **State Management**: Using `useState` and `useEffect` for tracking agent position, grid cells, game status, and percept history.
  * **Custom Hooks**: The `useWumpusGame` hook encapsulates the entire game loop, isolating complex logic from the UI components.

### **Vite**
* **Purpose**: Next-generation frontend tooling.
* **Usage in Project**:
  * Serves as the local development server, providing extremely fast Hot Module Replacement (HMR) during development.
  * Bundles the project for production deployment, ensuring optimized loading times and minimal asset sizes.

### **Node.js & NPM**
* **Purpose**: JavaScript runtime environment and package manager.
* **Usage in Project**: Managing project dependencies (`package.json`) and running scripts (`npm run dev`, `npm run build`).

---

## 2. Styling & UI Aesthetics

### **Tailwind CSS**
* **Purpose**: Utility-first CSS framework for rapid UI development.
* **Usage in Project**:
  * Handles the structural layout (e.g., flexbox, grids, spacing, typography).
  * Makes the application fully responsive (`lg:w-[22rem]`, `flex-col lg:flex-row`).
  * Used for conditional styling based on game state.

### **Vanilla CSS (`index.css`)**
* **Purpose**: Custom styling for complex visual effects that go beyond standard Tailwind utilities.
* **Usage in Project**:
  * **Liquid Glassmorphism**: Creating the frosted-glass panel effects (`backdrop-filter: blur()`, custom semi-transparent backgrounds).
  * **Neon Glow Effects**: Defining custom CSS variables (`--neon-cyan`, `--neon-purple`) and applying text-shadows (`.text-glow-cyan`).
  * **Animations**: Implementing grid cell shimmer effects, agent ripple animations, hazard pulsing, and the dynamic iridescent rotating gradients for safe cells.

---

## 3. Core Game Logic & AI Engine

### **Vanilla JavaScript (ES6+)**
* **Purpose**: The brain of the Wumpus Agent. No external AI or math libraries were used; everything is built from scratch.
* **Usage in Project**:
  * **Resolution Engine (`kb.js`)**: A custom-built propositional logic engine. It parses the world state, generates clauses, and uses the resolution algorithm to mathematically prove if a cell is safe or contains a hazard.
  * **Knowledge Base (KB)**: Maintains an array of logical clauses representing everything the agent has learned so far.
  * **Percept Handling (`percepts.js`)**: Processes sensory input (Breeze, Stench, Glitter) based on the agent's current coordinates.
  * **Grid Matrix (`gridUtils.js`)**: Handles the dynamic generation of the 2D grid, randomizing pit placements, Wumpus location, and the gold, ensuring the game is mathematically solvable (winnable game logic).

---

## 4. Deployment & Hosting

### **Vercel**
* **Purpose**: Cloud platform for static sites and Serverless Functions.
* **Usage in Project**: 
  * Hosts the live production version of the React application.
  * Integrates directly with the GitHub repository for continuous deployment (CD)—automatically building and deploying every time new code is pushed to the `main` branch.

### **Git & GitHub**
* **Purpose**: Version control and source code hosting.
* **Usage in Project**:
  * Tracking changes, backing up source code, and serving as the source of truth for the Vercel deployment pipeline.
  * A `.gitignore` file ensures heavy directories like `node_modules` are excluded from tracking.
