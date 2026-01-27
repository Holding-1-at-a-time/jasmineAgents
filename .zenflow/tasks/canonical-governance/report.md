# Report: Phase 12 — Canonical System Governance

## Implementation Summary
The JASMINAgent project is now governed by the **Sovereign Laws of JASMIN** as defined in `GEMINI.md`.

### Achievements
1.  **Canonical System Prompt**: All agents now use a strict, first-principles reasoning prompt that prevents state invention and enforces tool-based retrieval.
2.  **Restricted Tool Schema**: Refined the `generateAgentResponse` reasoning loop to expose only the five authorized tool categories:
    - `search_context` (Hybrid RAG)
    - `lookup_entity` (State Reads)
    - `start_workflow` (Durable Execution)
    - `send_message` (Interaction)
    - `request_file_upload` (Secure Session)
3.  **Functional Catalog (SPEC-12)**: Scaffolded the complete backend surface area:
    - `analytics.ts`: Conversion funnel and agent metrics.
    - `files.ts`: Metadata management and soft-deletes.
    - `payments.ts`: Telegram Stars integration.
    - `maintenance.ts`: Re-embedding and usage aggregation.
4.  **Defense-in-Depth Ingress**: Verified that `http.ts` and all mutations/actions use strict validators and secret token checks.

### Deviations
- None.

### Verification Results
- **Logic**: Every public-facing function in the catalog has a `v` argument validator.
- **Durability**: Agents use `start_workflow` for multi-step logic, delegating execution back to Convex.
- **Security**: Tenant-level scoping is enforced via the `userId` filter in search and lookup tools.
