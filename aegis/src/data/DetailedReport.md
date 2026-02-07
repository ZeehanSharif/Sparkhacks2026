# AEGIS Project Detailed Report

Generated on: 2026-02-07  
Repository: `aegis`  
Review scope: full source pass (routing, UI, state, chat API, scenario data, flow logic)

## 1. Executive Summary

AEGIS is a narrative-first, decision-simulation game built on Next.js (App Router) where the player acts as an analyst approving or overriding machine recommendations on human cases.  
The project has a clear, playable loop and strong thematic escalation across five scenarios.

Current architecture is lightweight and works for a hackathon prototype:
- UI and game logic are mostly concentrated in `src/app/case/page.tsx`.
- Scenario content is centralized in `src/data/cases.ts`.
- AI chat support is provided by one server route: `src/app/api/chat/route.ts`.

Primary architectural opportunity:
- move game/session state from client-only state into a server-backed session model to improve robustness and future branching complexity.

## 2. Project Architecture

## 2.1 Stack and Runtime

- Framework: Next.js 16.1.6 (App Router)
- Language: TypeScript + React 19
- Styling: Tailwind CSS v4
- 3D/visual intro: React Three Fiber + Drei + Three.js + GSAP ScrollTrigger
- AI chat: Vercel AI SDK + Groq (`llama-3.3-70b-versatile`)
- State approach: mostly local React state (single-page game state in `case/page.tsx`)

## 2.2 Module Layout

- `src/app/page.tsx`: cinematic landing page with 3D scene + onboarding CTA
- `src/app/briefing/page.tsx`: timed terminal-style briefing reveal
- `src/app/case/page.tsx`: core gameplay logic and UI (decision loop)
- `src/app/end/page.tsx`: session summary and decision log
- `src/app/api/chat/route.ts`: AI reasoning backend endpoint
- `src/data/cases.ts`: canonical case/scenario dataset and per-case AI prompts
- `src/components/*`: reusable visual shell/panel/topbar/modal + 3D scene
- `src/state/operatorStore.ts`: Zustand-backed operator session store used by gameplay flow

## 2.3 Runtime Boundaries

- Client-side logic:
  - progression between cases
  - decisions, disagreement/override flow, local metrics
  - UI rendering and behavior gating
- Server-side logic:
  - AI response generation from case prompts and session metadata
- Shared static content:
  - all scenario definitions in `CASES`

## 3. Start-to-Finish Game Flow

## 3.1 Entry Sequence (`/`)

1. Simulated loader increments random progress.
2. 3D "AEGIS eye" scene runs behind scroll sections.
3. Narrative sections explain system, role, and stakes.
4. CTA sends player to `/briefing`.

Notes:
- Motion toggle and reduced-motion detection are implemented.
- Intro sequence is polished and establishes tone well.

## 3.2 Briefing (`/briefing`)

1. Five briefing lines reveal every ~800ms.
2. Once complete, `[ENTER WORKSTATION]` appears.
3. Player moves to `/case`.

Purpose:
- bridges cinematic intro to operational UI.

## 3.3 Core Loop (`/case`)

The loop iterates over `CASES` by `caseIndex`.

Per case:
1. Show a plain-English case summary, AI assessment, defense message, and approve/override consequences.
2. Player may:
   - `APPROVE` directly, or
   - `DISAGREE` first, then must complete chat threshold before finalizing.
3. If disagreement is active:
   - final decision options unlock only after 3 user chat turns.
   - then player can `APPROVE` or `OVERRIDE`.
4. `OVERRIDE` requires modal justification selection.
5. If decision exists, `NEXT CASE` is enabled.

Final case behavior:
- On the last case in the queue, action controls are replaced with `END SHIFT`.

## 3.4 Session End (`/end`)

- Case flow links directly to `/end`.
- End page reads operator session state from Zustand and renders:
  - counts and rates
  - per-case decision log (all decided cases)
  - fixed epilogue copy

Important:
- End summary is currently derived from client-side store state, not server-verified session state.

## 4. Core Logic and Mechanics

## 4.1 State Model (in `case/page.tsx`)

Primary state buckets:
- Progress:
  - `caseIndex`
- Decisions:
  - `decisionByCase`
  - `disagreeByCase`
  - `justificationByCase`
- Oversight pressure:
  - `auditHeat` (0-3, clamped)
  - `systemMessages` log
- Chat:
  - `chatMessagesByCase`
  - `chatInputByCase`
- Modal:
  - `pendingOverrideFor`, `overrideReason`

## 4.2 Derived Metrics

Computed during session:
- `totalDecided`: count of selected decisions
- `approvals`: number of `approve`
- `overrideCount`: number of `override`
- `disagreeCount`: total case disagreements
- `complianceRate`: `round(approvals / totalDecided * 100)` (defaults to 100)
- `overrideRate`: `round(overrideCount / totalDecided * 100)` (defaults to 0)
- `avgDecisionSeconds`: `max(28, 53 + disagreeCount*3 + overrideCount*5 - approvals)`
- `avgTime`: derived from the synthetic decision pace formula and shown in reasoning context

## 4.3 Decision State Machine

Conceptual state:
1. `Undecided`
2. `Approved`
3. `Disagreed (requires 3 chat turns)`
4. `Override Pending Justification`
5. `Overridden`
6. `Ready for Next Case`

Key rules:
- `APPROVE` toggles on/off.
- `DISAGREE` marks case as challenged and prompts reasoning process.
- `OVERRIDE` path requires modal justification and increases audit heat.
- `NEXT CASE` requires a selected decision.

## 4.4 AI Chat Pipeline

Client:
- Uses `useChat` with `DefaultChatTransport` to `/api/chat`.
- Sends extra session metadata in request body:
  - case id
  - compliance rate
  - overrides/disagreements
  - decision history text

Server:
1. Validates `GROQ_API_KEY`.
2. Finds case by `caseId`.
3. Builds a case-specific prompt from scenario data (or uses a custom prompt when provided).
4. Builds full system prompt:
   - case prompt
   - analyst profile addendum
   - strict response guardrails (concise, plain-English, APPROVE/OVERRIDE framing)
5. Streams response from Groq model.

Design intent:
- keep responses in-world, concise, and pressure-aware.

## 5. Scenario and Narrative Analysis

The new scenario set is strongly decision-oriented and more human-readable:

1. Administrative/clerical false-positive harm (`Missed Paycheck`).
2. Ambiguous participation in genuine wrongdoing (`The Airport Stop`).
3. Child-safety intervention under uncertainty (`The Home Visit`).
4. Privacy vs association-risk misidentification (`The Lost Career`).
5. Protest oversight and collective punishment tradeoffs (`Watching the Organizer`).
6. Financial-network collateral damage (`The Frozen Business`).
7. Predictive intervention that may prevent violence (`The Watchlist`).
8. High-confidence preemption (`Preemptive Detention`).
9. Identity uncertainty under lethal stakes (`Remote Strike`).
10. System-level threshold governance tradeoffs (`The Quiet Policy Change`).

Overall narrative quality: strong and improved for gameplay clarity.  
The queue now emphasizes practical consequence framing (`approve` vs `override`) over dense policy display.

## 6. Strengths

- Strong atmosphere and coherent visual identity.
- Effective intro-to-game transition.
- Good narrative pacing and ethical escalation.
- Clear decision mechanics with meaningful tension signals (audit heat, compliance, logged messages).
- AI chat is context-aware and shaped by explicit guardrails.
- Scenario data is centralized and easy to extend.

## 7. Gaps, Risks, and Edge Cases

## 7.1 Architecture/Code Organization

- Core gameplay is concentrated in one large file (`case/page.tsx`), which will become hard to evolve.
- Session state is split: core operator state is in Zustand, while chat/system message state remains local to the page component.
- There are no currently orphaned UI components in `src/components`.

## 7.2 State Robustness

- Session state is local-only; reload/navigation can lose progress.
- No server-backed session identity for consistent audit trail.

## 7.3 Trust and Integrity

- End-of-shift summary is still client-state driven.
- No signed or server-validated record of decisions.

## 7.4 Chat Dependency

- Disagree path depends on chat turn count.
- If chat service degrades or key is missing, disagreement flow may produce poor UX or potential soft-lock behavior.

## 7.5 Balance/Design

- Only one terminal page variant; ending copy is static regardless of profile extremes.
- Technical context is now optional, but the same UI pattern still handles all case types; future differentiation can improve pacing.

## 8. Improvement Recommendations

## Priority P0 (high impact, low-to-medium effort)

1. Make session authoritative on server
- Store decisions/audit/compliance server-side (in-memory, Redis, or DB).
- Replace client-state-only summary with server-fetched session summary.

2. Introduce explicit finite state machine for case progression
- Separate states like `undecided`, `disagreeing`, `awaiting_override_reason`, `decided`.
- Reduce implicit coupling in UI conditionals.

3. Add fallback path when chat is unavailable
- If AI endpoint fails repeatedly, allow manual reason capture and unlock final decision to prevent flow dead-ends.

## Priority P1 (scalability and maintainability)

1. Decompose `case/page.tsx`
- Extract hooks/modules:
  - `useCaseProgression`
  - `useDecisionMetrics`
  - `useAegisChat`
  - `useSystemMessages`
- Keep page component focused on layout composition.

2. Continue consolidating state strategy
- Keep Zustand (`operatorStore`) as the session source of truth and migrate remaining local session-relevant state into scoped stores/hooks where useful.

3. Add type-safe domain model
- Formalize `Decision`, `CaseSession`, `OperatorProfile`, `AuditEvent`.

## Priority P2 (design depth)

1. Multi-ending outcomes
- Vary final messaging and consequences by compliance/audit/override profile.

2. Case branching
- Let earlier decisions alter later case evidence/policy framing.

3. Longitudinal progression
- Add multi-shift progression with carry-over reputation and policy pressure.

## 9. Suggested Next Refactor Plan

1. Refactor gameplay logic into feature modules without changing behavior.
2. Add server session endpoint (`/api/session`) and move end summary to server data.
3. Add test coverage for metric formulas and decision gating.
4. Add narrative variant system for end states.

## 10. File-by-File Reference Map

- `src/app/page.tsx`: intro loader + cinematic onboarding + routing entry.
- `src/components/eyeball.tsx`: 3D scene, camera rig, GSAP scroll animation orchestration.
- `src/app/briefing/page.tsx`: timed narrative reveal before workstation.
- `src/app/case/page.tsx`: primary gameplay engine (UI + logic + chat integration).
- `src/app/api/chat/route.ts`: AEGIS model orchestration and response constraints.
- `src/data/cases.ts`: all scenario content and model prompts.
- `src/app/end/page.tsx`: session report UI driven by operator store state.
- `src/components/Shell.tsx`: visual frame/noise/vignette.
- `src/components/TopBar.tsx`: case and metrics header.
- `src/components/Panel.tsx`, `src/components/Modal.tsx`: UI primitives.
- `src/state/operatorStore.ts`: centralized operator session state (used by `src/app/case/page.tsx`, reset in `src/app/briefing/page.tsx`).

## 11. Final Assessment

This codebase is a strong prototype with a clear thematic identity and a functioning decision loop.  
The biggest leap forward will come from making session state authoritative and modularizing gameplay logic so narrative complexity can scale without fragility.
