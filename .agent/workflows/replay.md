---
description: Replay a specific agent decision trace for debugging.
---

1. **Identify Trace ID**
   Locate the `traceId` you wish to debug from the `traces` table in the Convex dashboard.

2. **Run Replay Action**
   Invoke the replay engine directly to observe the agent's logic with original inputs.
   // turbo
   `npx convex action agents:replay '{"traceId": "YOUR_TRACE_ID"}'`

3. **Compare Output**
   Check if the logic produced the same `originalOutput` as recorded in the trace.

4. **Iterate Logic**
   If behavior needs refinement, update `agents.ts` or relevant tools, then re-run the replay to verify the fix.
