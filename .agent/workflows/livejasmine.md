---
description: ###Executive Summary  In the context of the **JASMINAgent** distributed architecture, workflows represent the procedural implementation of high-load agentic tasks within the **Antigravity IDE** [User Input]. While Large Language Models (LLMs) functi
---

---

### Objectives & Success Criteria

The primary objective of implementing **Antigravity Workflows** within the JASMINAgent platform is to eliminate cognitive drift and execution ambiguity during long-horizon, agent-driven development and operations. Workflows act as deterministic execution rails that constrain probabilistic reasoning, ensuring that all AI-assisted output converges on production-safe, Convex-aligned implementations.

Success is defined across four dimensions:

* **Procedural Determinism:** 100% adherence to the explicitly numbered workflow steps. The agent must never skip, reorder, or speculate beyond the current step. Each step represents a hard dependency boundary, mirroring durable backend workflow execution semantics.
* **Transactional Correctness:** Any step that mutates state must be designed to compile into **Convex mutations or workflows** that rely on Optimistic Concurrency Control (OCC), guaranteeing serializability and atomic commits under concurrent load.
* **System Performance Alignment:** Workflow-generated code must default to **Next.js 16 Partial Prerendering (PPR)**, Cache Components, and React Server Components (RSC) to ensure sub‑100ms shell delivery and streamed AI content.
* **Agent Reliability:** All non-deterministic operations (LLM inference, vision screening, third-party APIs) must be modeled as resumable, journaled steps compatible with Convex Durable Workflows.

---

### Functional Requirements: Workflow Primitives

A production-grade workflow in the JASMINAgent stack is a **procedural contract**, not a suggestion. Each workflow must include the following primitives:

1. **Title and Description**
   Clear metadata describing architectural intent and system boundaries (e.g., "Lead Qualification Durable Sequence" or "PII-Safe Onboarding Workflow"). The description must state whether the workflow is read-only, mutative, or long-lived.

2. **Strictly Numbered Steps**
   Steps must be sequential, immutable, and linear. Each step corresponds conceptually to a Convex transaction boundary or workflow journal entry. If a prerequisite step fails, downstream steps are forbidden from executing.

3. **Agent Directives**
   Explicit slash-command or role invocation (e.g., `/qualify-lead`, `/audit-memory`, `/ingest-rag`) that binds the step to a specific agent persona. This prevents cross-agent responsibility bleed (e.g., a Scout agent mutating billing state).

4. **Typed Placeholders**
   All runtime inputs (e.g., `tenantId`, `threadId`, `leadId`) must be declared explicitly and treated as untrusted until validated. Placeholders exist to preserve strict multi-tenant isolation and enforce schema-first thinking.

---

### Architecture Overview: Rule–Workflow Composition

The Antigravity ecosystem enforces a two-layer governance model that mirrors Convex’s own separation of concerns:

* **Persistent Governance Layer (`GEMINI.md`)**
  Defines non-negotiable system laws: Convex-only persistence, identity checks via `ctx.auth.getUserIdentity()`, validator-first schemas, async-only dynamic APIs in Next.js, and mandatory durability for side-effecting logic. These rules apply globally and cannot be overridden by workflows.

* **Procedural Execution Layer (Workflows)**
  Defines *what happens and in what order*. Workflows translate business intent (e.g., onboarding, recruitment, monetization) into stepwise execution plans that can later be compiled into Convex Actions, Workflows, and Agent calls.

This composition ensures that AI reasoning is always grounded in the platform’s deterministic primitives, including Agent memory, RAG retrieval, Action Caching, Rate Limiting, and Workpools.

---

### Implementation Roadmap: Authoring a Workflow

#### Step 1: Workspace Initialization

Create a workspace-scoped workflow inside the Antigravity IDE via **Customizations → Workflows → + Workspace**. Each workflow is repository-specific and must not be reused across unrelated projects to avoid architectural leakage.

#### Step 2: Structural Definition

Workflows must be authored in structured markdown with explicit frontmatter. Example:

```markdown
---
title: "Lead Qualification & Ingestion"
description: "Durable recruitment workflow from Telegram intake to qualified lead state."
---

1. **Context Loading**  
   Load lead, tenant, and thread context via a Convex query. Identity must be verified and tenant-scoped.

2. **Vision Screening (Non‑Deterministic)**  
   Invoke a multimodal model (e.g., qwen3‑vl via Ollama Cloud). Treat output as advisory only; journal the raw result.

3. **Deterministic Evaluation**  
   Apply rule-based validation and thresholds inside Convex. No direct model output may mutate state.

4. **State Transition (Mutative)**  
   Commit lead status change via an OCC-protected mutation. Conflicts must be retried implicitly by Convex.

5. **Durable Checkpoint**  
   Journal step completion using the Workflow Manager to guarantee resumability after crashes or deploys.
```

#### Step 3: Invocation & Compilation

Workflows are invoked via slash commands or task assignment. The agent must translate the workflow into concrete artifacts: `spec.md`, `plan.md`, Convex functions, and tests—always respecting `GEMINI.md` constraints.

---

### Failure Modes & Mitigations

| Risk              | Failure Mode                        | Mitigation Strategy                                                     |
| ----------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| Step Skipping     | Agent jumps ahead in reasoning      | Enforce numbered checkpoints and explicit “stop-and-verify” rules       |
| Concurrent Writes | OCC conflicts under load            | Use serialized mutations or sharded counters                            |
| LLM Instability   | Inference failure or hallucination  | Journal outputs, retry with backoff, never commit model output directly |
| External Outage   | Stripe / Telegram / Ollama downtime | Model as durable Convex workflows with resumable steps                  |

---

### Validation & Test Strategy

A workflow is considered valid only when it can be mechanically translated into Convex-backed execution:

* Every mutative step maps to a Convex mutation or workflow step.
* Every non-deterministic step is journaled and retry-safe.
* All monetization logic routes through **Telegram Stars (XTR)**.
* Unit tests (Jest + convex-test) exist for state transitions and authorization boundaries.

Final validation is achieved by running `npx convex dev` and confirming TypeScript 5+ compliance, validator coverage, and deterministic retries under simulated failure conditions.
