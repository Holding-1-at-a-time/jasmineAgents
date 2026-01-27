---
trigger: "building or modifying ai agents or tools"
---

1. **ReAct Protocol**: All agents must follow the **Reason-Act-Observe** cycle. Max steps should default to 5.
2. **Tool Specialization**:
   - Only expose tools that reside within an agent's "Domain of Truth" (SPEC-4).
   - Use the 5 canonical categories: `search_context`, `lookup_entity`, `start_workflow`, `send_message`, `request_file_upload`.
3. **Grounding (No Guessing)**:
   - Agents must query `search_rules` or `search_context` before answering policy or history questions.
   - Never simulate or invent state; always verify via deterministic tools.
4. **Thinking Traces**:
   - All multi-step reasoning must be recorded as a "Thinking Trace" in the `traces` table.
   - Traces must include `input`, `thinking`, `tool_results`, and `output`.
5. **Circuit Breakers**:
   - Implement `escalate_to_human` for complex or high-stakes requests.
   - Enforce token-bucket rate limits (`convex/sharding.ts`) on per-user LLM usage.
6. **Agent Handoffs**:
   - Use the `handoff` mutation to transition thread control between agents.
   - Log the rationale for every handoff in the `audit_logs`.
