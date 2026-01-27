---
name: "Agentic Workflow Architect"
description: "Mastery of ReAct reasoning loops, tool-based RAG, and multi-agent governance."
---

# Agentic Workflow Architect

This skill defines how the JASMINAgent thinks and acts. It focuses on grounding probabilistic LLM outputs in deterministic Convex tools.

## Core Directives

### 1. The ReAct Loop (Reason -> Act -> Observe)
- **Cycle**: The agent must provide a `thought` (Reasoning), then call a `tool` (Act), then ingest the `result` (Observation).
- **Limit**: Enforce `maxSteps: 5` to prevent infinite loops and manage costs.
- **Grounding**: If the agent detects a context gap (e.g., "how much do I get paid?"), it MUST call `search_rules` or `search_memory` before answering.

### 2. Traceability & Audit
- **Requirement**: Every agent step must be recorded in the `traces` table.
- **Thinking Traces**: Use the `generateText` with `experimental_telemetry` or manual chunk extraction to save "Thinking" blocks.
- **Audit Logs**: Any tool that modifies state (e.g., `start_workflow`) must also emit an `audit_log` entry.

### 3. Handoff Governance (SPEC-4)
- **Domain Boundaries**: Never allow an agent to use tools outside its domain (e.g., Scout should not access Payout tools).
- **Explicit Handoff**: Use the `handoff` mutation to transfer thread state. The agent must explain the reason for the handoff.

## Snippets & Patterns

### Grounded Search Tool
```typescript
search_rules: tool({
  description: "Verify agency rules before qualifying.",
  parameters: v.object({ query: v.string() }),
  execute: async ({ query }) => {
    return await ctx.runAction(internal.knowledge.searchKnowledgeBase, { query });
  }
})
```
