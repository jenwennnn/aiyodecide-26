# 🛡️ AiyoDecide (AiyoSafe)

> **UMHackathon 2026 Submission** | Domain: AI for Economic Empowerment & Decision Intelligence

AiyoDecide is a proactive, AI-powered financial decision-support engine built for Malaysian young adults, students, and gig workers. Instead of merely tracking expenses *after* they happen, AiyoDecide acts as an empathetic financial guardian, evaluating daily dilemmas against strict personal constraints to protect cash flow and optimize wealth.

## 🚀 Live Demo
[https://aiyosafe-26-i1v6gulqj-jenwennns-projects.vercel.app/]

## 💌 Pitch Video & Pitch Deck
[https://canva.link/uird14hwyei3omm]

## ✨ Core Features
* **Progressive Financial Snapshot:** Users establish a baseline profile (Income, Rent, Debt) and set unbreakable personal constraints (e.g., "Must maintain an RM500 emergency buffer").
* **"Decide Lah!" Engine:** Users input unstructured, natural language financial dilemmas (in English or Manglish). The system simulates the economic outcome and mathematically justifies an approval or rejection.
* **Quantifiable Impact Dashboard:** A dynamic visual interface tracking total RM saved, late fees avoided, time optimized, and an overall AiyoSafe health score.
* **Explainable AI:** Dynamic microcopy that explicitly tells the user *why* their financial score moved, grounded in their specific recent activities.

## 🛠️ Architecture & Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion
* **AI Engine:** Google Gemini 2.5 Flash (via `@google/genai` SDK)
* **Context Management:** `localStorage` for secure, rapid, privacy-first context stitching.
* **Deployment:** Vercel

### The LLM Service Layer
AiyoDecide relies entirely on **Google Gemini 2.5 Flash** as its core reasoning engine. We employ a *Stitched Context* prompting architecture. The user's baseline financial profile is injected into a master prompt alongside their daily scenario. Gemini processes the constraints, calculates the real-world economic impact, and returns a strict JSON schema which directly hydrates the React dashboard.

## 💻 Getting Started (Local Development)

### 1. Clone the repository
git clone [https://github.com/jenwennnn/umhackathon-aiyosafe.git](https://github.com/jenwennnn/umhackathon-aiyosafe.git)
cd umhackathon-aiyosafe

### 2. Install dependencies
npm install

### 3. Environment Setup
Create a .env file in the root directory and add your Google Gemini API key. (Note: Vite requires the VITE_ prefix).

VITE_GEMINI_API_KEY=your_gemini_api_key_here

### 4. Run the development server
npm run dev
Open http://localhost:5173 to view it in the browser.