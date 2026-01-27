import { Agent } from "@convex-dev/agent";
import { v } from "convex/values";

// Scout: Discovery & traffic origination
// Owns: Source attribution, first-touch metadata
export const scout = new Agent({
  name: "scout",
  tools: [
    {
      name: "record_attribution",
      description: "Log source attribution for a new lead.",
      parameters: v.object({
        sourceCode: v.string(),
        metadata: v.any(),
      }),
      handler: async () => {
          // In reality, calls convex/solver.ts:solveLP
          console.log("Analyst running optimization.");
          return { status: "solved", result: { allocation: [0.5, 0.5] } };
      }
    },
  ],
});
