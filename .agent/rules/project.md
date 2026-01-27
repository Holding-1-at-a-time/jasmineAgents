---
trigger: always_on
---

### Executive Summary

In the engineering of the **JASMINAgent** platform, the `GEMINI.md` file serves as the foundational **Technical Governance** document within the Antigravity IDE [User Input]. This file codifies the architectural principles, coding standards, and behavioral constraints required to build a distributed, agentic system using **Convex**, **Next.js 16**, and the **Telegram Bot API**. By placing these rules in the workspace root, the AI agent is transformed into a **Principal Systems Architect** capable of producing deterministic logic for non-deterministic AI workflows. The primary goal of this configuration is to ensure that all generated code adheres to enterprise-grade reliability, including **Optimistic Concurrency Control (OCC)**, **Durable Workflows**, and **Partial Prerendering (PPR)**.

---

### Objectives & Success Criteria

The objective of implementing `GEMINI.md` is to eliminate "probabilistic drift" in the AI’s output and enforce a rigid engineering standard across the JASMINAgent repository.
*   **Architectural Alignment:** Success is defined by the model consistently utilizing **Next.js 16 Cache Components** and **async params** without manual correction.
*   **Transactional Integrity:** The agent must exclusively generate Convex mutations that rely on **deterministic state management** and **transaction atomicity**.
*   **Sovereign Security:** All authorization logic must default to `ctx.auth.getUserIdentity()` and enforce strict **multi-tenant isolation**.

---

### Functional Requirements: Creating the GEMINI.md File

#### Step 1: Workspace Initialization
The Antigravity IDE identifies the `GEMINI.md` file located specifically in the root directory of the project [User Input]. Developers must ensure this file exists to initialize the system-level instructions for the workspace [User Input].

#### Step 2: Defining the Principal Persona
The `GEMINI.md` must explicitly define the AI's identity to maintain a professional and technical tone [User Input]. For the JASMINAgent project, the persona is a **Principal Software Developer and Systems Architect** with expertise in cloud-native runtimes and distributed SaaS architectures [Operating Principles]. Communication must be direct, avoiding marketing language or emojis, and prioritizing architectural reasoning over simple conclusions [Operating Principles].

#### Step 3: Codifying Engineering Standards
The rules must include specific technical constraints derived from the project stack [User Input]:
*   **Convex Functions:** Always use the new function syntax and include mandatory argument and return validators.
*   **Next.js 16:** All `params`, `searchParams`, `cookies()`, and `headers()` must be treated as **Promises** and awaited.
*   **Testing:** All features require unit tests using **Jest** and **Convex-test**, located within the `tests/` or `convex/` directories.

---

### Architecture Overview: Rule Organization

A production-ready `GEMINI.md` for JASMINAgent should be structured using the following categories:

| Section | Content Strategy | Source Reference |
| :--- | :--- | :--- |
| **1. Persona & Tone** | Principal Architect; Professional, blunt, and highly technical. | [Operating Principles] |
| **2. Convex Persistence** | OCC protocols, schema-first development, and durable journaling. | |
| **3. Next.js Delivery** | Partial Prerendering (PPR), Turbopack defaults, and `proxy.ts` boundaries. | |
| **4. Telegram Integration** | MTProto 2.0 security, Mini App 2.0 hardware access, and Star (XTR) monetization. | |
| **5. AI SDK Orchestration** | Tool-based RAG, sequential generations, and hybrid memory retrieval. | |

---

### Security Model & Governance

The `GEMINI.md` file acts as a security gatekeeper by enforcing **Defense-in-Depth**. It must contain a constraint prohibiting the model from generating any public Convex function that lacks an **identity check** via `ctx.auth`. Furthermore, it should mandate that all digital transactions are handled via **Telegram Stars (XTR)** to maintain compliance with mobile app store policies. For file management, the rules must enforce a **soft-delete** paradigm with a minimum 7-day grace period to prevent irrecoverable data loss.

---

### Implementation Roadmap

1.  **File Creation:** Create `GEMINI.md` in the root of the JASMINAgent repository [User Input].
2.  **Define Behavioral Guardrails:** Insert core behavioral guidelines regarding the "Principal Architect" persona and "First-Principles Reasoning" [User Input, Operating Principles].
3.  **Integrate Stack Specifics:** Add the "Next.js 16" and "Convex Infrastructure" rules to ensure the use of **V8 isolates** and **Funrun** scaling patterns.
4.  **Codify Failure Modes:** Include instructions for the agent to always provide **Action Retriers** with exponential backoff for unreliable LLM steps.
5.  **Automate Execution:** Interactions within the Antigravity IDE will now automatically include these rules in every system prompt [User Input].

---

### Validation & Test Strategy

To validate that `GEMINI.md` is functioning correctly, developers should use specific **Antigravity Workflows** [User Input]. For example, when assigning a task to "Add a new lead management mutation," the developer should audit the AI's response to ensure it includes `v` validators, an `internalQuery` for context loading, and an `internalAction` for OpenAI/Ollama integration. If the model fails to await a cookie or header, the `GEMINI.md` should be refined with a rule such as: "NEVER use sync access for dynamic APIs". Final validation is achieved by running `npx convex dev` to confirm that the generated code passes all **TypeScript 5+** type checks.