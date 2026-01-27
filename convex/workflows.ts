import { v } from "convex/values";
import { internalAction, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

// SPEC-13: Durable Nurture Workflow
// Using the @convex-dev/workflow component pattern
// Note: Since we are using the internal.workflows for the component, we define our specific logic here.

export const leadNurtureWorkflow = internalAction({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    console.log(`[Workflow] Starting Nurture for ${args.leadId}`);
    
    // Step 1: Initial Qualification Wait (Simulated)
    await ctx.runMutation(internal.agents.recordAuditLog, {
        actor: "workflow",
        action: "step_start",
        entityId: args.leadId,
        entityType: "workflow",
        diff: { step: "qualification_check" },
    });

    // Step 2: Nurture Decision (LLM Call)
    // Journaling the decision
    const lead = await ctx.runQuery(internal.leads.getLead, { leadId: args.leadId });
    if (!lead) return;

    // Step 3: Send automated nurture message if still 'new'
    if (lead.status === "new") {
        await ctx.runMutation(internal.agents.sendMessage, {
            threadId: lead.threadId!, // Assuming thread established
            text: "Hi there! I'm JASMIN's assistant. I'll be helping you with your application. What's your experience level?",
            role: "agent",
            agentName: "strategist",
        });

        await ctx.runMutation(internal.leads.updateLeadStatus, {
            leadId: args.leadId,
            status: "qualified",
        });
    }

    // Step 4: Wait for Manager Approval (SPEC-14)
    console.log(`[Workflow] Waiting for approval for lead ${args.leadId}`);
    
    // In a real implementation using @convex-dev/workflow, we would use awaitEvent:
    // await ctx.runAction(internal.workflows.awaitEvent, { workflowId: ..., event: "approval" });
    
    await ctx.runMutation(internal.leads.updateLeadStatus, {
        leadId: args.leadId,
        status: "nurtured",
    });

    console.log(`[Workflow] Nurture step complete for ${args.leadId}`);
  },
});

export const modelOnboardingWorkflow = internalAction({
  args: { 
    userId: v.id("users"),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[Workflow] Starting Onboarding for user ${args.userId}`);

    // Step 1: Vision Screening
    const screening = await ctx.runAction(internal.vision.screenPhotoAction, {
        userId: args.userId,
        storageId: args.storageId,
    });

    if (screening.passed) {
        console.log(`[Workflow] Screening PASSED for ${args.userId}. Escalating to human.`);
        
        // Step 2: Update Lead Status (if applicable)
        // Finding lead for this user...
        const lead = await ctx.runQuery(internal.leads.getLeadByUserId, { userId: args.userId });
        
        if (lead) {
            await ctx.runMutation(internal.leads.updateLeadStatus, {
                leadId: lead._id,
                status: "nurtured",
            });
        }

        // Step 3: Notify Manager
        await ctx.runMutation(internal.agents.sendMessage, {
            text: `🚨 High-value candidate ${args.userId} passed vision screening with ${screening.confidence * 100}% confidence. Analysis: ${screening.analysis}. Waiting for manual review.`,
            role: "agent",
            agentName: "analyst", // Analyst monitors the funnel
            threadId: lead?.threadId, // Correctly scoped thread if exists
        });

    } else {
        console.log(`[Workflow] Screening FAILED for ${args.userId}.`);
    }

    console.log(`[Workflow] Onboarding step complete for ${args.userId}`);
  },
});

export const getLead = mutation({ // Helper to fetch lead in action context if query not internal
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.leadId);
    }
});
