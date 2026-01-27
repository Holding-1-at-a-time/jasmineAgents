# Feature: Telegram Lead Flow with Agentic Memory (Hybrid RAG)

## Difficulty
**hard**

## Technical Context
- **Runtime**: Convex (V8 isolates)
- **Persistence**: Convex DB (OCC, strictly validated)
- **Memory**: Hybrid RAG (Convex search + Vector search)
- **Workflows**: Durable Workflow Manager (journaled, resumable)

## Convex Function Inventory
- `http.ts`: `/leadpipe` and `/telegram` (HTTP Actions)
- `leads.ts`: `ingestLead`, `updateLeadStatus` (Mutations)
- `memories.ts`: `hybridSearch`, `generateMessageEmbedding` (Actions/Mutations)
- `agents.ts`: `ask`, `generateAgentResponse` (Actions)
- `workflows.ts`: `leadNurtureWorkflow` (Durable Workflow)

## Control Flow
1. **Ingest**: HTTP Action `leadpipe` -> Mutation `leads:ingestLead`.
2. **Memory**: Background Action `memories:generateMessageEmbedding` (via scheduler).
3. **Reason**: Action `agents:ask` -> AI SDK -> Tool `search_context`.
4. **Lifecycle**: Mutation `leads:updateLeadStatus` -> Trigger `leadNurtureWorkflow`.

## Failure Model
- **LLM Timeout**: Retried via Action Retrier.
- **OCC Conflict**: Automatically retried by Convex.
- **Workflow Interruption**: Resumed from last journaled step.
