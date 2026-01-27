---
description: Verify the ReAct reasoning loop and tool-based RAG integrity.
---

1. **Seed Knowledge Base**
   Ensure the `knowledge_base` table is populated with current agency rules and policies.
   // turbo
   `npx convex mutation knowledge:seedKnowledgeBase`

2. **Trigger Verification Simulation**
   Run the dedicated ReAct test script which simulates a complex query requiring multi-step reasoning.
   // turbo
   `npx tsx scripts/verify-react-loop.ts`

3. **Audit Thinking Traces**
   Examine the latest traces to confirm the agent successfully identified the context gap and called the correct tools.
   - Look for `ACT` steps in the output of the script.
   - Verify the `search_rules` tool was used if payout or policy questions were asked.

4. **Verify Persistent Journaling**
   Check the `traces` table in the Convex dashboard to ensure "Thinking" blocks were persisted for the multi-step transaction.
