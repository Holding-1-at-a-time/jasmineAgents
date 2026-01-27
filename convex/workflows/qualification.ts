import { v } from "convex/values";
import { Workflow } from "@convex-dev/workflow";
import { internal } from "../_generated/api";

// Lead Qualification Workflow (SPEC-6)
// Deterministic execution rails for recruitment
export const leadQualificationWorkflow = new Workflow({
  name: "leadQualification",
  args: {
    userId: v.id("users"),
    threadId: v.id("threads"),
  },
  handler: async (step, args) => {
    // 1. Context Loading
    const context = await step.runQuery(internal.users.getLeadContext, {
        userId: args.userId
    });

    // 2. Evaluation Step (Probabilistic logic can be called via actions)
    // For now, we simulate a deterministic rule-based check
    const isQualified = context.hasPhoto && context.hasBio;

    // 3. State Transition (OCC-protected via Mutation)
    if (isQualified) {
        await step.runMutation(internal.users.setQualified, {
            userId: args.userId,
            qualified: true
        });
        
        // 4. Durable Handoff (Emitting Event)
        await step.runMutation(internal.agents.handoff, {
            threadId: args.threadId,
            toAgent: "nurturer",
            reason: "Lead qualified via workflow"
        });
    }

    return { qualified: isQualified };
  },
});
