---
name: "Convex Engineering Master"
description: "Advanced instructions for building deterministic, OCC-safe, and durable agentic backends on Convex."
---

# Convex Engineering Master

This skill provides the architectural foundation for the JASMINAgent persistence layer. It ensures that all code adheres to the core laws of Convex.

## Core Directives

### 1. Determinism First
- **Constraint**: Mutations and Queries MUST be pure functions of their inputs and the database state.
- **Forbidden**: `Math.random()`, `Date.now()`, or external `fetch` calls inside mutations/queries.
- **Remedy**: Use `ctx.runAction` for non-deterministic logic (AI, APIs) and pass results back to mutations.

### 2. Optimistic Concurrency Control (OCC)
- **Problem**: Hotspots on single documents (e.g., a global counter) will cause transaction restarts.
- **Solution**: 
    - Keep mutations small and fast.
    - Use **Sharded Counters** for high-frequency increments.
    - Use **Idempotency Keys** (e.g., `updateId`) to prevent duplicate processing.

### 3. Durable Workflows
- **Trigger**: Any business logic with >1 side effect (e.g., send message + update status).
- **Architecture**:
    - Use `@convex-dev/workflow`.
    - Journal every step using `workflow.step()`.
    - Handle retries at the infrastructure level, never in the agent logic.

## Snippets & Patterns

### OCC-Safe Counter
```typescript
// use convex/sharding.ts helpers
await ctx.runMutation(internal.sharding.incrementCounter, { name: "lead_tokens", shards: 10 });
```

### Identity Validation
```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthenticated");
const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
```
