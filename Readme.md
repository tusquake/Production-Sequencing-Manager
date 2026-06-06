# Production Order Sequencing Manager
### SAP Fiori UI Prototype

---

## Overview

This is a frontend-only UI prototype for a configurable production order sequencing tool built for SAP BTP. It allows production planners to import orders, define mixing rules, simulate sequencing, and visualise the resulting production line flow — all without any backend or database.

The core business problem it solves: given a list of production orders of different types (CBU, KD, TVL), apply configurable mixing rules to determine the optimal sequence on the shop floor.

---

## Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                            │
│                                                                 │
│   1. Dashboard       →   2. Production Orders                   │
│   (Overview KPIs)        (View & filter orders)                 │
│                                    │                            │
│                                    ▼                            │
│   4. Simulation      ←   3. Sequencing Rules                    │
│   (Run & visualise)      (Configure mixing rules)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page-by-Page Flow

### 1. Dashboard
**Entry point of the application.**

- Displays KPI cards showing the count of total orders broken down by type: CBU, KD, and TVL, plus the number of active rules.
- An order type distribution donut chart gives a quick visual of the composition of the order pool.
- A sequencing compliance bar chart shows how well the last simulation respected the configured rules.
- Recent activity log shows the latest simulation runs, rule changes, and order imports.

**Purpose:** Gives the planner a quick health check before acting.

---

### 2. Production Orders
**Where the planner reviews the raw order list.**

- Displays all 30 mock production orders in a sortable, filterable table.
- Each order has: Order ID, Order Type (CBU / KD / TVL), Quantity, Priority (High / Medium / Low), Status (Pending / In Progress / Done), Material, and Due Date.
- The planner can search by Order ID, filter by type, priority, or status, and sort by any column.
- The **"Run Sequencing"** button at the top right triggers a simulation run and navigates directly to the Simulation page with results pre-loaded.

**Purpose:** Lets the planner inspect and understand the raw input before sequencing.

---

### 3. Sequencing Rules
**Where the planner configures how orders should be mixed.**

This is the configuration heart of the application. Rules are displayed as cards and can be toggled on/off, edited, or deleted.

#### Rule Types

**Ratio Rule**
Defines a mixing ratio between two order types. The most important rule in this domain.

Example: *For every 3 CBU orders, insert 1 KD order.*

This means the sequencer will group 3 CBU orders together, then insert 1 KD order, then repeat. The rule card shows a visual preview:

```
[CBU] [CBU] [CBU]  →  [KD]
```

**Restriction Rule**
Prevents a specific order type from following another.

Example: *TVL cannot directly follow KD.*

This means after a KD order, the next slot must be a CBU (or another non-TVL type). The sequencer will hold TVL orders back until a safe position is found.

**Priority Rule**
Within a type group, orders are sorted by priority (High → Medium → Low) before being placed in the sequence.

#### Creating a New Rule
Clicking **"+ Create Rule"** opens a modal. The form dynamically shows different fields depending on the selected rule type. For a Ratio Rule, a live preview chip bar updates as you type to show what the resulting group pattern will look like.

---

### 4. Simulation
**Where the sequencing is computed and visualised.**

This is the most important page. It is split into four sections:

#### Left Panel — Original Order List
Shows the raw orders as imported, in their original, unsequenced order. This is the "before" state.

#### Right Panel — Optimised Sequence
Shows the result of running the sequencing algorithm against the active rules. Orders are rearranged into groups following the configured ratio. This is the "after" state.

Example output for a 3:1 CBU-KD ratio rule:
```
[CBU] [CBU] [CBU] [KD]
[CBU] [CBU] [CBU] [KD]
[CBU] [TVL]
```

#### Production Line Flow
A horizontal, colour-coded flow strip that visualises the full sequence end-to-end, mimicking a physical production line view:

```
[CBU] → [CBU] → [CBU] → [KD] → [CBU] → [CBU] → [CBU] → [KD] → [TVL]
```

Colour coding:
- 🔵 **CBU** — Blue
- 🟠 **KD** — Orange
- 🩵 **TVL** — Cyan

#### Rule Validation Panel
After the simulation, each active rule is evaluated against the generated sequence and a pass / fail / warning result is shown:

```
✅ CBU-KD Ratio Rule Passed       — All groups follow 3:1 ratio correctly
✅ TVL Restriction Rule Passed    — No TVL order follows a KD order
❌ High Priority First Violated   — 2 priority inversions detected within type groups
```

---

### 5. Settings
**Application and simulation configuration.**

- Plant ID and name
- Active production shift
- Toggle: auto-run simulation on order import
- Toggle: show violations only in validation panel
- Maximum sequence length
- Email alert notifications on rule violation

---

## Sequencing Algorithm (Mock Logic)

The simulation uses the following logic when "Run Simulation" is clicked:

```
1. Separate orders into three buckets: CBU[], KD[], TVL[]

2. Read the active Ratio Rule (default: 3 CBU per 1 KD)

3. Loop:
   a. Take [ratio] CBU orders from the CBU bucket → append to sequence
   b. Take 1 KD order from the KD bucket → append to sequence
   c. Check Restriction Rule: if last order is NOT KD, take 1 TVL → append
   d. Repeat until all buckets are empty

4. Append any remaining TVL orders at the end (after CBU, not KD)
```

This directly implements the business rule from the specification:
> *For every 3 CBU orders there needs to be 1 KD order. TVL orders should not occur after KD orders but they can occur after CBU orders.*

---

## Colour Legend

| Order Type | Colour  | Hex       |
|------------|---------|-----------|
| CBU        | Blue    | `#1b6ec2` |
| KD         | Orange  | `#e07b00` |
| TVL        | Cyan    | `#0891b2` |

---

## Mock Data

- **30 production orders** (PO1001–PO1030) across 3 types
- 18 CBU orders (60%), 8 KD orders (27%), 4 TVL orders (13%)
- Priorities: High, Medium, Low
- Statuses: Pending, In Progress, Done
- **3 pre-configured rules**: CBU-KD Mixing Rule, TVL Restriction Rule, High Priority First

---

## Technology

| Layer       | Technology                        |
|-------------|-----------------------------------|
| UI          | Vanilla HTML5 + CSS3 + JavaScript |
| Styling     | Custom SAP Fiori-inspired CSS     |
| Data        | Inline mock JSON (no backend)     |
| Charts      | Pure SVG                          |
| Framework   | None (zero dependencies)          |

> This prototype is intended to be opened directly in a browser as a single `index.html` file. No build step, no server, no dependencies.

---

## Intended Next Steps (Production Build)

1. **Connect to SAP S/4HANA** — Replace mock data with live production order data via OData/BTP APIs
2. **Persist rules** — Store sequencing rules in SAP BTP PostgreSQL or HANA Cloud
3. **Authentication** — Integrate SAP BTP XSUAA for role-based access (Planner / Viewer)
4. **Export** — Allow the planner to export the optimised sequence back to SAP PP as a planned order update
5. **React + UI5 Web Components** — Migrate to `@ui5/webcomponents-react` for full SAP Fiori compliance

---

*Prototype version 1.0.0 — Plant MFG-001, Hamburg*
