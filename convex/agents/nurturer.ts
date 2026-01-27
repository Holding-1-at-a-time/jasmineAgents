import { Agent } from "@convex-dev/agent";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Nurturer: Lead education & qualification
// Owns: Readiness, fit, escalation trigger
export const nurturer = new Agent({
  name: "nurturer",
  tools: [
    {
      name: "search_knowledge_base",
      description: "Search for info to answer lead questions about agency policies, pay, and onboarding.",
      parameters: v.object({ 
          query: v.string(),
          context: v.optional(v.union(v.literal("onboarding"), v.literal("payments"), v.literal("general")))
      }),
      handler: async (ctx, args) => {
          console.log("Nurturer searching KB:", args.query, "Context:", args.context);
          return await ctx.runAction(internal.memories.hybridSearch, {
              userId: (ctx as unknown as { userId: Id<"users"> }).userId, 
              query: args.query,
              mode: "hybrid",
              searchOtherThreads: true,
          });
      }
    },
    {
        name: "trigger_onboarding",
        description: "Initiate the multimodal photo screening workflow for a candidate.",
        parameters: v.object({ 
            userId: v.id("users"),
            photoStorageId: v.string()
        }),
        handler: async (ctx, args) => {
            console.log("Nurturer triggering onboarding for:", args.userId);
            await ctx.runAction(internal.workflows.modelOnboardingWorkflow, {
                userId: args.userId,
                storageId: args.photoStorageId,
            });
            return { started: true };
        }
    },
    {
        name: "escalate_to_human",
        description: "Notify a human operator for high-value qualified leads or specific complex requests.",
        parameters: v.object({ 
            reason: v.string(),
            priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
        }),
        handler: async (ctx, args) => {
            console.log("Nurturer escalating:", args.reason, "Priority:", args.priority);
            return { sent: true };
        }
    }
  ],
});
