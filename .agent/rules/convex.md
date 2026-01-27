---
trigger: "building or modifying convex functions"
---

1. **Strict Validation**: ALL public-facing Convex functions (Queries, Mutations, Actions, Workflows) MUST have a `v` argument validator.
2. **Deterministic Boundaries**: 
   - Queries and Mutations must be 100% deterministic (no `Math.random`, `Date.now` side effects, or external API calls).
   - Use `ctx.db` for all state persistence.
3. **Optimistic Concurrency (OCC)**:
   - Design mutations to be small and atomic to minimize OCC conflicts.
   - Use sharded counters (`convex/sharding.ts`) for high-frequency writes.
4. **Authorization**:
   - Every read and write MUST resolve the user identity via `ctx.auth.getUserIdentity()`.
   - Never assume tenant context; always verify `userId` or `tenantId` from the authenticated token.
5. **Durable Workflows**:
   - Any logic requiring multiple side effects or spanning >10 seconds MUST be a Durable Workflow.
   - Steps must be journaled to ensure idempotency and resumability.
6. **Naming Conventions**:
   - Use `internalQuery`, `internalMutation`, and `internalAction` for private logic.
   - Separate business logic into `convex/` service files (e.g., `leads.ts`, `users.ts`).
