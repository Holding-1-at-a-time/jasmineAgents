# Tool-based RAG & ReAct Cycles Spec

## Executive Summary
In the **JasminAgent** framework, **ReAct (Reason + Act)** cycles and **Tool-based RAG** transform LLMs from simple generative engines into grounded reasoning orchestrators. This mechanism decouples probabilistic reasoning from deterministic information retrieval, ensuring that agent decisions are auditable, verifiable, and free from hallucinations.

## The ReAct Mechanism: Reason, Act, Observe

Iterative loops where the agent alternates between thinking and interacting with deterministic tools.

1.  **Reason (Identify Context Gaps)**: The model analyzes the current context (threads, memory, workflows). If information is missing, it flags a need for external retrieval.
2.  **Act (Deterministic Retrieval)**: The model triggers a tool call (e.g., `searchContext`, `lookupCandidate`). Tools return structured, validated data from Convex.
3.  **Observe (Grounding & Synthesis)**: Results are appended to the context. The model synthesizes a response grounded in the newly observed facts.

## Operational Integration

### 1. Circuit Breakers
- **maxSteps**: Prevents infinite loops or circular reasoning. (Recommended: 3–5).
- **stopWhen**: Configurable conditions to end the reasoning loop.

### 2. Auditability & Observability
- **Thinking Traces**: Intermediate reasoning steps are stored in the `thinking` field of the `traces` table.
- **Journaling**: Every tool call and result is persisted in Convex for post-hoc analysis by the Analyst Agent.

### 3. Tool Composition (Flight Booking Pattern)
Agents can chain multiple specialized tools to solve multi-stage tasks:
- `searchRules` -> `lookupCandidate` -> `verifyProfile` -> `escalateToHuman`

---

## Technical Implementation (TypeScript)

### Tool Definition Example
```typescript
const searchRecruitmentCriteria = createTool({
  description: "Search for agency qualification standards for model candidates.",
  args: z.object({
    query: z.string().describe("The criteria to verify against candidate input")
  }),
  handler: async (ctx, { query }) => {
    const results = await rag.search(ctx, {
      namespace: "agency-rules",
      query
    });
    return results.text;
  }
});
```

### Reasoning Loop Configuration
```typescript
const result = await generateText({
  model: myModel,
  tools: { searchRecruitmentCriteria, ... },
  maxSteps: 5, // Enable ReAct cycles
  prompt: "Verify the lead status against our LiveJasmin recruitment criteria.",
});
```

## Security & Governance
- **Tenant Isolation**: All RAG queries must include `userId` or `tenantId` boundaries.
- **Identity Safety**: Candidates remain anonymous until qualification triggers an escalation workflow.
- **Durable State**: Use Convex Workflows to ensure ReAct cycles survive infrastructure restarts.

## Failure Modes & Resilience
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Circular Reasoning | Infinite Loop | `maxSteps` circuit breaker |
| LLM Hallucination | False Qualification | Grounding via Tool-based RAG results |
| API Failure | Partial Sequence | Action Retriers with exponential backoff |
