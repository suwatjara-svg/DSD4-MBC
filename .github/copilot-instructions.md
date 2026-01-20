# Copilot Instructions for BMC-AI

## Project Overview
BMC-AI is a web-based Business Model Canvas (BMC) generator that integrates Google's Gemini API to generate business model components from user input. The application is a simple single-page application (SPA) with three main features: AI generation, PDF export, and canvas rendering.

## Architecture & Key Components

### Frontend Stack
- **index.html**: Single-page application with Thai language labels (`ชื่อธุรกิจ`, `รายละเอียดเบื้องต้น`)
- **script.js**: Core logic with two main functions:
  - `generateAI()`: Sends business data to Google Gemini API and parses JSON response
  - `renderBMC()`: Renders BMC components as a 3x3 grid
  - `exportPDF()`: Uses jsPDF library to generate downloadable PDF
- **style.css**: CSS Grid layout (3 columns) for the 9-box BMC canvas

### External Dependencies
- **jsPDF** (`libs/jspdf.umd.min.js`): Client-side PDF generation library
- **Google Gemini API**: Cloud-based AI model for BMC content generation (requires API key)

## Critical Developer Patterns

### API Integration
- Gemini API key is currently hardcoded in `script.js` (line 2: `"YOUR_GEMINI_API_KEY"`) - **should be moved to environment variables**
- Prompt engineering is in Thai language; prompts must be adjusted if supporting multiple languages
- Response parsing expects specific JSON structure with 9 BMC fields

### Data Flow
1. User inputs business name and description (HTML inputs)
2. `generateAI()` constructs a Thai-language prompt
3. API returns JSON with 9 BMC components
4. `renderBMC()` converts JSON to DOM elements
5. `exportPDF()` captures rendered content and exports

### BMC Structure
The 9 components are hardcoded in both the prompt (line 6-15) and rendering loop:
```
Key Partners | Key Activities | Value Propositions
Customer Relationships | Channels | Customer Segments
Cost Structure | Revenue Streams
```
Order matters for visual layout - maintain this sequence if refactoring.

## Conventions & Common Patterns

- **Thai Language**: All UI labels and AI prompts use Thai. Maintain linguistic consistency when extending.
- **Minimal Dependencies**: Project avoids framework overhead (no React/Vue) - keep additions lightweight
- **Direct DOM Manipulation**: Use `document.getElementById()` and `appendChild()` patterns for DOM updates
- **Async/Await**: All API calls use async/await; maintain this pattern for consistency

## Common Development Tasks

### Adding New BMC Fields
1. Update the prompt in `generateAI()` (add field to JSON template)
2. Add corresponding input elements in `index.html`
3. Ensure CSS grid is adjusted if changing the 3x3 layout

### Modifying API Integration
- Gemini endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Response structure: `data.candidates[0].content.parts[0].text`
- Always validate JSON parsing before rendering

### PDF Export Issues
- Current export captures all `.bmc-box` elements in order
- PDF positioning is linear (y-axis increments by 30px) - adjust spacing in `exportPDF()` if content lengths vary

## Known Issues & TODOs

- API key hardcoded - extract to `.env` or environment variable
- No error handling for API failures or invalid JSON responses
- PDF layout is simplistic (doesn't maintain grid structure of web view)
- No input validation for empty fields before API call
