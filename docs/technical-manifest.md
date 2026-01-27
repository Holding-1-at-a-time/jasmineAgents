# JASMINAgent: Technical Manifest (v1)

## 1. Architectural Core
JASMINAgent is a **Convex-Centric Agentic System**. It operates on the principle that Large Language Models (LLMs) are **probabilistic reasoning engines**, while Convex is the **deterministic truth layer**.

| Layer | Technology | Responsibility |
| :--- | :--- | :--- |
| **Persistence** | Convex (Postgres + Vector) | Schema, OCC, Identity, Durability |
| **Brain** | Vercel AI SDK + Ollama | ReAct Loops, Tool Calling, RAG |
| **Surface** | Telegram Mini Apps 2.0 | UI, Auth, Payments (XTR) |
| **Infrastructure** | Next.js 16 | PPR, RSC, BFF Proxy |

## 2. The Multi-Agent Governance Matrix (SPEC-4)
Agents are bound by strict domain boundaries to prevent authority bleed.

- **Scout**: Traffic origination and attribution lock.
- **Diplomat**: Identity mapping and platform threading.
- **Nurturer**: Lead education (RAG) and qualification.
- **Strategist**: Content planning and outbound broadcast.
- **Analyst**: Funnel optimization via Convex Solver.

## 3. Reliability Primitives
- **Durable Workflows**: Any operation with side effects is a journaled workflow step.
- **ReAct Cycles**: Agents follow Reason -> Act -> Observe. No guessing allowed.
- **Action Caching**: Embeddings and expensive LLM calls are deduplicated in `actionCache`.
- **Sharded Counters**: High-frequency metrics use sharding to avoid database contention.

## 4. Security Philosophy
- **Zero-Trust**: All ingress (Webhooks, Mini App initData) is cryptographically verified.
- **Sovereign Identity**: Telegram ID is the primary key; `ctx.auth` enforces tenant isolation.
- **Data Sovereignty**: Monetization is exclusively via **Telegram Stars (XTR)**.

## 5. Deployment & Observability
- **Traces**: Every AI decision is logged with tokens, rationale, and tool inputs.
- **Audit Logs**: State transitions are immutable and verifiable.
- **Replay Engine**: Any agent step can be replayed deterministically with original inputs.
