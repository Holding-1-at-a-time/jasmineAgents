---
trigger: "adding logging, tracing, or audit features"
---

1. **Audit Logs**:
   - Every state transition (status change, handoff, qualification) MUST be recorded in the `audit_logs` table.
   - Include `actor`, `action`, `entityId`, and `diff`.
2. **Deterministic Traces**:
   - Record tokens, rationale, and tool inputs for every LLM interaction.
   - Use the `recordTrace` mutation for consistent visibility.
3. **Workflow Journaling**:
   - Durable workflows must journal their state after every logical step.
   - Use `WorkflowManager` hooks to automate step logging.
4. **Error Boundaries**:
   - Distinguish between retryable infrastructure failures (Ollama timeout) and fatal logical errors.
   - Use Exponential Backoff with Jitter for action retries.
5. **Analytics Engine**:
   - Aggregate metrics (Total Tokens, Avg Duration) via the `Analyst Dashboard` queries.
   - Use `AnalystAgent` to identify funnel drop-offs and suggest recalibrations.
6. **Privacy**:
   - Never log raw PII (Personally Identifiable Information) in plain-text audit logs.
   - Ground reasoning in `threadId` and `leadId`, avoiding direct user identifiers where possible.
