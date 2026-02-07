Teamembers: Zeehan Sharif, Fernando Caudillo Tafoya, Michael Rosas, Peter Nguyen

# Sparkhacks 2026 - (AEGIS) Algorithmic Evaluation & Governance Intelligence System

AEGIS is an interactive narrative simulation built with Next.js and Tailwind CSS. You play an analyst inside a state-scale decision engine, processing cases and ratifying AI recommendations. Your actions shape both citizen outcomes and your own operator profile, with escalating tension between compliance, audit risk, and moral intervention.

## Why we chose it

We built AEGIS because we realized AI is already making decisions that affect real people's lives, loan denials, flagged accounts, and detention orders. Still, we never see the actual human cost of getting it wrong. So we created a simulator where you have to decide: do you trust the algorithm or override it? We wanted to make the invisible visible, to show that every choice ripples outward, and that neither approving nor rejecting the AI protects you from consequences. The Decision Impact Review at the end is the gut-punch, which forces you to face what your decisions actually meant to Elena, to Rashid, to all these people, reminding you that nuance isn't weakness, it's the only honest way to think about power.

## Features

- 5 narrative cases with escalating complexity and consequences
- Operator metrics: throughput, deviation rate, audit heat, access level
- Actions: Approve, Challenge, Override (with justification)
- Dynamic UI feedback: redaction, audit warnings, system messages
- End-of-game summary and replay

## Code Structure
```
aegis/
├── src/
│   ├── app/
│   │   ├── end/
│   │   │   └── page.tsx
│   │   ├── case/
│   │   │   └── page.tsx
│   │   ├── briefing/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── chat/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── Shell.tsx
│   │   ├── Modal.tsx
│   │   ├── Panel.tsx
│   │   ├── TopBar.tsx
│   │   └── eyeball.tsx
│   │
│   ├── data/
│   │   ├── cases.ts
│   │   └── DetailedReport.md
│   │
│   └── state/
│       └── operatorStore.ts
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local
```

## Getting Started

1. Install dependencies:
   ```
   cd aegis
   npm install
   ```
2. Start the development server (will need a .env.local file with grok key for api):
   ```
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app/` — Pages and main UI
- `src/components/` — UI components
- cases.ts — Case definitions
- `src/state/operatorStore.ts` — Global state management
---
