---
description: ###Executive Summary  In the context of the **JASMINAgent** distributed architecture, workflows represent the procedural implementation of high-load agentic tasks within the **Antigravity IDE** [User Input]. While Large Language Models (LLMs) functi
---



---

### Objectives & Success Criteria

The primary objective of implementing Antigravity workflows is to eliminate "cognitive drift" during complex development cycles by providing the AI with a rigid operational roadmap.
*   **Operational Success:** 100% adherence to the sequential steps defined in the workflow file, preventing the skip-ahead errors common in long-context AI interactions [User Input].
*   **Architectural Success:** Ensuring that every workflow step involving data mutation utilizes **Convex's Optimistic Concurrency Control (OCC)** to maintain transaction atomicity and serializability.
*   **Performance Success:** Workflows must facilitate the generation of code that supports **Next.js 16 Partial Prerendering (PPR)** and **Cache Components** for instant interface delivery.

---

### Functional Requirements: Components of a Workflow

A production-grade workflow in the JASMINAgent stack must include four foundational primitives:
1.  **Title and Description**: Clearly defined metadata that explains the architectural intent (e.g., "ID Verification Durable Sequence") [User Input].
2.  **Numbered Steps**: A rigid sequence of instructions that must be followed in linear order to ensure dependencies—such as creating a database session before performing a vector search—are satisfied [297, User Input].
3.  **Agent Directives**: Specialized slash commands (e.g., `/onboard-lead`) that invoke the specific agent responsible for the current unit of work, such as the Scout or Analyst [17, User Input].
4.  **Placeholders**: Input variables that accept request-time data, such as a user’s `sessionId` or `tenantId`, to maintain multi-tenant isolation boundaries [142, 297, User Input].

---

### Architecture Overview: The Rule-Workflow Integration

The Antigravity ecosystem utilizes a two-layered governance model to manage the JASMINAgent stack:
*   **The Persistent Layer (GEMINI.md)**: This file contains the "Base Rules"—such as enforcing the use of the new Convex function syntax or mandatory TypeScript 5+ type safety—which are automatically applied to every interaction [1817, User Input].
*   **The Procedural Layer (Workflows)**: These define the "Task Trajectory." While `GEMINI.md` dictates *how* to write code (the standards), the workflow dictates *what* to do (the process), such as researching requirements before generating a specification in `plan.md` [User Input].

This integration ensures that AI-driven "reasoning" is grounded in the project’s specific technical primitives, such as the use of **Ollama Cloud** for high-parameter multimodal vision screening.

---

### Implementation Roadmap: Writing a Workflow

#### Step 1: Initialization
Access the **Customizations** panel in the Antigravity IDE by clicking "..." and navigating to the Workflows tab. Developers should select "+ Workspace" to create a workflow specific to the JASMINAgent repository, ensuring it stays isolated from other projects [User Input].

#### Step 2: Structural Definition
Utilize structured markdown to define the sequence. For the JASMINAgent recruitment funnel, a "Lead Qualification Workflow" should be structured as follows:
```markdown
---
title: "Lead Qualification & Ingestion"
description: "Process new model leads from Telegram through qualification state."
---

1. **Context Loading**: Call `ctx.runQuery` to retrieve the current lead state from the Convex `leads` table.
2. **Vision Screening**: Invoke `qwen3-vl` to analyze the candidate's portfolio photos for compliance.
3. **State Transition**: Execute a mutation to update the lead's status to 'Qualified' using OCC-protected logic.
4. **Durable Hand-off**: Journal the step completion to the **Workflow Manager** to ensure resilience against server restarts.
``` [User Input].

#### Step 3: Invocation
The developer can invoke the completed logic via a slash command (e.g., `/lead-qualification-and-ingestion`). This triggers the model to begin Step 1, using the `GEMINI.md` rules to ensure that the code produced uses the correct validators and async dynamic APIs [1162, 1821, User Input].

---

### Risks & Mitigations

| Risk | failure Mode | Mitigation Strategy |
| :--- | :--- | :--- |
| **Non-Deterministic Skipping** | The model attempts Step 3 before completing Step 2. | Use **numbered checkpoints** and enforce a "verify-before-proceed" rule in `GEMINI.md` [User Input]. |
| **Data Race Vulnerability** | Workflow steps modify shared data simultaneously. | Mandate the use of **Sharded Counters** or serialized Convex mutations within the workflow instructions. |
| **API Failure** | A third-party provider (e.g., Stripe) goes offline mid-workflow. | Model the IDE workflow to generate **Durable backend Workflows** that journal outcomes to the DB for resumption. |

---

### Validation & Test Strategy

To validate that a workflow is implementation-ready, developers must perform **Meta-Prompting** [User Input]. This involves generating a full technical specification outside the IDE and comparing the workflow's output against known JASMINAgent primitives, such as the requirement that all digital transactions are conducted via **Telegram Stars (XTR)**. Final validation is confirmed by running **Jest** unit tests within the integrated terminal as the last step of the workflow sequence to ensure the generated code passes all functional and security audits [User Input].