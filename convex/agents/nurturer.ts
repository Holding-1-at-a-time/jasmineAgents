import { Agent } from "@convex-dev/agent";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Nurturer: Lead education & qualification
// Owns: Readiness, fit, escalation trigger
export const nurturer = new Agent({
  name: "nurturer",
  tools: [
    {
      name: "search_knowledge_base",
      description: "Search for info to answer lead questions.",
      parameters: v.object({ query: v.string() }),
      handler: async (ctx, args) => {
          console.log("Nurturer searching KB:", args.query);
          return { results: ["Relevant info about JasminAgent services"] };
      }
    },
    {
        name: "escalate_to_human",
        description: "Notify a human operator for high-value qualified leads.",
        parameters: v.object({ reason: v.string() }),
        handler: async (ctx, args) => {
            console.log("Nurturer escalating:", args.reason);
            return { sent: true };
        }
    }
  ],
});
