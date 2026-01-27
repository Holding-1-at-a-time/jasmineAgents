# Lead Lifecycle & State Machine

This document defines the monotonic progression of a recruitment lead within the JASMINAgent system.

## 1. Lifecycle States

| State | Agent Owner | Definition | Trigger |
| :--- | :--- | :--- | :--- |
| **`entry`** | Scout | Initial contact via `/start` or LeadPipe. | Deep link ingestion. |
| **`education`** | Nurturer | Lead is asking questions and receiving RAG-grounded info. | Intent detection (Question). |
| **`qualification`** | Nurturer | Lead has submitted model photos and passed screening. | `modelOnboardingWorkflow` success. |
| **`nurtured`** | Nurturer | Lead is high-fit but not yet ready for contract. | Fit score > 0.8. |
| **`escalated`** | Diplomat | Complex issue or high-value request needing Human. | `escalate_to_human` tool. |
| **`closed`** | Analyst | Converted or rejected from the funnel. | Manual or auto-timeout. |

## 2. State Machine Logic

### Deterministic Transitions
- `entry` -> `education`: Automatic upon first user message in a new thread.
- `education` -> `qualification`: Triggered when the user uploads a photo and the `verify_profile` tool confirms compliance.
- `qualification` -> `escalated`: If the lead is verified as "VIP" or "Complex," the `Diplomat` agent takes over.

### Guardrails
- **Immutable Attribution**: The `source` (e.g., `linkedin_ad_1`) is locked at `entry` and cannot be mutated by later agents.
- **Audit Requirement**: Every state change MUST be recorded in the `audit_logs` table with the previous and new states.

## 3. Tooling
- `internal.leads.updateState`: The primary mutation for transitioning leads.
- `internal.agents.handoff`: The mutation that shifts agent context alongside state.
- `api.analytics.getFunnelMetrics`: Provides the current distribution of leads across all states.
