# Agent Tool Catalog (SPEC-12 Alignment)

This catalog lists the authorized deterministic tools available to JASMINAgents. All tools are wrapped in `v` validators and respect tenant isolation.

## 1. Context & Memory (search_context)
- **`search_memory`**: Hybrid RAG (Lexical + Semantic) across user history and specific threads.
- **`search_rules`**: Search the `knowledge_base` for agency policies, payout slabs, and onboarding rules ($SEARCH\_RULES$).

## 2. State & CRM (lookup_entity)
- **`lookup_candidate`**: Retrieves verified CRM data for a model, including screening history and fit scores.
- **`get_lead_status`**: Reads the current monotonic state from the `qualification_state` table.

## 3. Durable Execution (start_workflow)
- **`trigger_onboarding`**: Starts the `modelOnboardingWorkflow` for multimodal photo screening.
- **`recalibrate_system`**: Used by the **AnalystAgent** to emit optimization signals to the system.

## 4. Interaction & UI (send_message)
- **`send_message`**: Dispatches a Telegram message via the `sendMessage` mutation.
- **`request_file_upload`**: Initiates a secure session for uploading media (Presigned URL flow).

## 5. Escalation & Safety
- **`escalate_to_human`**: A circuit breaker tool that halts agent reasoning and notifies model managers.
- **`handoff`**: Transfers thread control to a different specialized agent (e.g., Scout -> Nurturer).

## 6. Analytics (Analyst Only)
- **`get_funnel_metrics`**: Aggregates conversion data per source.
- **`rank_sources`**: Calculates ROI and traffic quality scores.
