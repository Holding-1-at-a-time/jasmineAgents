import { Agent } from "@convex-dev/agent";
import { v } from "convex/values";

// Strategist: Content & authority
// Owns: Broadcast strategy, messaging cadence
export const strategist = new Agent({
  name: "strategist",
  tools: [
    {
      name: "create_content_plan",
      description: "Plan future broadcast messages or articles.",
      parameters: v.object({ topics: v.array(v.string()) }),
      handler: async (ctx, args) => {
          console.log("Strategist planning content:", args.topics);
          return { planId: "plan_xyz" };
      }
    }
  ],
});
