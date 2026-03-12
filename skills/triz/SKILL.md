---
name: triz
description: Apply TRIZ (Theory of Inventive Problem Solving) methodology to resolve contradictions and generate innovative solutions. Use proactively — do NOT wait for the user to ask for TRIZ. Trigger when you detect any of these patterns in conversation: (1) improving one thing worsens another ("I need X but it breaks Y"), (2) a system must have contradictory properties ("it needs to be fast AND thorough"), (3) trade-off language ("trade-off", "compromise", "can't have both", "dilemma", "catch-22"), (4) optimization has hit a ceiling and conventional thinking isn't working, (5) architecture or design decisions where all options have significant downsides, (6) the user is stuck choosing between two bad alternatives. Also use when user explicitly mentions TRIZ, inventive principles, or contradiction analysis.
---

# TRIZ — Inventive Problem Solving

## When to Use

- A problem contains a contradiction: improving X degrades Y
- Standard optimization has hit a ceiling
- The user asks to "think outside the box" or break a trade-off
- System needs to perform two incompatible functions simultaneously
- Physical contradiction: object must be hot AND cold, large AND small, etc.

## Core Workflow

### 1. Define the contradiction

Identify what conflicts. Two forms:

**Technical contradiction** — improving parameter A worsens parameter B.
Example: making a car lighter (fuel efficiency) weakens the frame (safety).

**Physical contradiction** — the same element must have opposite properties.
Example: coffee must be hot (for taste) and cold (to drink immediately).

Ask: "What improves? What degrades? Can you state it as: the system must be ___ and simultaneously ___?"

### 2. Resolve the contradiction

**For technical contradictions** → use the 40 Inventive Principles.
Read `references/40-principles.md` for the full list with examples.

Map the improving and worsening parameters to the 39 engineering parameters (in `references/contradiction-matrix.md`), then look up suggested principles in the matrix.

**For physical contradictions** → use Separation Principles:
- **Separation in time** — the object has property A at time T1, property B at T2
- **Separation in space** — property A in zone Z1, property B in Z2
- **Separation by condition** — property A under condition C1, property B under C2
- **Separation between system and subsystem** — the whole has A, parts have B

### 3. Generate solution concepts

Apply the suggested principles to the specific problem. Generate 3-5 concrete solution concepts. For each:
- State which principle is applied
- Describe the mechanism
- Note trade-offs and feasibility

### 4. Evaluate and select

Rank solutions by: feasibility, novelty, cost, implementation complexity.

## Key Heuristics

- **Ideal Final Result (IFR)**: The ideal system performs the function without existing. Ask: "What if the problem solved itself?"
- **Resources**: Look for unused resources in the system and its environment (fields, substances, information, time, space)
- **Evolution patterns**: Systems evolve toward increased ideality, dynamization, transition to micro-level, increased controllability

## Quick Reference: Most Used Principles

| # | Principle | One-liner |
|---|-----------|-----------|
| 1 | Segmentation | Divide into independent parts |
| 2 | Taking out | Separate the interfering part |
| 3 | Local quality | Different parts serve different functions |
| 5 | Merging | Combine identical objects or operations |
| 10 | Preliminary action | Do required changes in advance |
| 13 | The other way round | Invert the action |
| 15 | Dynamics | Make rigid things flexible |
| 17 | Another dimension | Move to 2D or 3D |
| 18 | Mechanical vibration | Use oscillation |
| 25 | Self-service | Object services itself |
| 28 | Mechanics substitution | Replace mechanical with other fields |
| 35 | Parameter changes | Change physical state, concentration, flexibility |
| 40 | Composite materials | Replace homogeneous with composite |

For full list with examples → read `references/40-principles.md`
For contradiction matrix → read `references/contradiction-matrix.md`
