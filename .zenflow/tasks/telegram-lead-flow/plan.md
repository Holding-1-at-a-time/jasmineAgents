# Implementation Plan: Telegram Lead Flow with Agentic Memory

## Step 1 — Ingestion Normalization
- [x] Implement `/leadpipe` in `http.ts`.
- [x] Create `ingestLead` in `leads.ts`.

## Step 2 — Hybrid Memory Retrieval
- [x] Implement `hybridSearch` in `memories.ts`.
- [x] Create `search_context` tool in `tools.ts`.

## Step 3 — Agent Reasoning Loop (AI SDK)
- [x] Integrate AI SDK in `agents.ts`.
- [ ] Implement `generateAgentResponse` with tool-calling for state transitions.

## Step 4 — Durable Nurture Workflow
- [ ] Create `leadNurtureWorkflow` in `workflows.ts`.
- [ ] Journal steps for qualification and escalation.

## Step 5 — Verification
- [ ] Simulate process crash during workflow.
- [ ] Verify memory grounding in agent traces.
