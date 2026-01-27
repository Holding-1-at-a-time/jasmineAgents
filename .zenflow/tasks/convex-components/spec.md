# SPEC-14: Convex Components & Dynamic Scalability

## Goal
Harden the JASMINAgent infrastructure by fully integrating Convex Components, optimizing for high throughput (sharding), and adopting Ollama Cloud for multimodal reasoning.

## Proposed Changes

### 1. Infrastructure Alignment
- **[MODIFY] [convex.config.ts](file:///c:/Users/rrome/jasmineAgents/convex.config.ts)**: Ensure all core components are mounted (Agent, Workflow, RAG, Rate Limiter, Action Cache). *[COMPLETED]*
- **[MODIFY] [next.config.ts](file:///c:/Users/rrome/jasmineAgents/next.config.ts)**: Enable `cacheComponents` and optimize for PPR.
- **[MODIFY] [package.json](file:///c:/Users/rrome/jasmineAgents/package.json)**: Add `ollama-ai-provider` for Ollama Cloud integration.

### 2. Schema Hardening
- **[MODIFY] [schema.ts](file:///c:/Users/rrome/jasmineAgents/convex/schema.ts)**:
    - Update vector dimensions to **768** (Gemma 300m).
    - Harmonize `leads` status to include `nurtured`, `escalated`, `onboarded`.
    - Update `files` table with soft-delete metadata and status.
    - Add `shards` table for manual sharded throughput primitives if needed for custom counters.

### 3. Agentic Memory & Tooling
- **[MODIFY] [memories.ts](file:///c:/Users/rrome/jasmineAgents/convex/memories.ts)**:
    - Shift to `embeddinggemma:300m` for embeddings.
    - Implement the **Action Cache** wrapper for embedding generation to reduce latency and cost.
- **[MODIFY] [agents.ts](file:///c:/Users/rrome/jasmineAgents/convex/agents.ts)**:
    - Adopt **Ollama Cloud** (`qwen3-vl:235b-cloud`) for multimodal reasoning in specialized agents.
    - Implement `sendMessageDraft` for real-time thinking traces in Telegram bots.

### 4. Throughput & Scalability
- **[NEW] [sharding.ts](file:///c:/Users/rrome/jasmineAgents/convex/sharding.ts)**: Implement a generic **Sharded Counter** and **Sharded Rate Limiter** utility using the "Power of Two" load balancing strategy.
- **[MODIFY] [analytics.ts](file:///c:/Users/rrome/jasmineAgents/convex/analytics.ts)**: Use sharded counters for high-frequency events (message sent, lead qualified).

### 5. Durable Workflows & File Management
- **[MODIFY] [workflows.ts](file:///c:/Users/rrome/jasmineAgents/convex/workflows.ts)**:
    - Enhance `leadNurtureWorkflow` with `awaitEvent` for manager approval.
- **[MODIFY] [http.ts](file:///c:/Users/rrome/jasmineAgents/convex/http.ts)**:
    - Add `/fs/upload` and `/fs/download` secure routes for file handling.

## Verification Plan
1. **Concurrency Test**: Simulate 100 concurrent "link clicks" to verify sharded counter integrity and low OCC conflicts.
2. **Durable Resume Test**: Manually fail a workflow step and verify it resumes from the journaled state.
3. **Multimodal Test**: Send an image to a test agent and verify `qwen3-vl` reasoning.
4. **Cache Proof**: Verify that embedding calls are skipped when the same content is processed within the TTL window.
