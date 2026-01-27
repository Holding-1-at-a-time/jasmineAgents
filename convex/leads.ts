import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// SPEC-11: Lead Ingestion via Userbot/LeadPipe
export const ingestLead = internalMutation({
  args: {
    telegramId: v.string(),
    sourceId: v.optional(v.string()),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    // 1. Check if lead already exists
    const existing = await ctx.db.query("leads")
        .withIndex("by_telegramId", (q) => q.eq("telegramId", args.telegramId))
        .unique();
    
    if (existing) {
        // Update metadata and return
        await ctx.db.patch(existing._id, {
            metadata: { ...existing.metadata, ...args.metadata },
            updatedAt: Date.now(),
        });
        return existing._id;
    }

    const leadId = await ctx.db.insert("leads", {
        telegramId: args.telegramId,
        sourceId: args.sourceId,
        status: "new",
        metadata: args.metadata,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    // 3. Trigger Qualification Workflow (SPEC-11/Durable Workflow)
    // We'll simulate this by scheduling an internal action
    await ctx.scheduler.runAfter(0, internal.leads.onNewLeadIngested, { leadId });

    return leadId;
  },
});

export const onNewLeadIngested = internalAction({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        console.log(`[LeadPipe] Processing lead ${args.leadId}`);
        // SPEC-13: Start the Durable Workflow for qualification/nurture
        await ctx.scheduler.runAfter(0, internal.workflows.leadNurtureWorkflow, { leadId: args.leadId });
    }
});

export const updateLeadStatus = mutation({
    args: {
        leadId: v.id("leads"),
        status: v.union(v.literal("new"), v.literal("qualified"), v.literal("nurtured"), v.literal("escalated"), v.literal("onboarded")),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Lead not found");

        // SPEC-7 Audit
        await ctx.db.insert("audit_logs", {
            actor: "system",
            action: "status_change",
            entityId: args.leadId,
            entityType: "lead",
            diff: { from: lead.status, to: args.status },
            createdAt: Date.now(),
        });

        await ctx.db.patch(args.leadId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    }
});

export const getLeadsByStatus = query({
    args: { status: v.union(v.literal("new"), v.literal("qualified"), v.literal("nurtured"), v.literal("escalated"), v.literal("onboarded")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("leads")
            .withIndex("by_status", (q) => q.eq("status", args.status))
            .collect();
    }
});

export const getLead = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.leadId);
    }
});

export const getLeadOfThread = query({
    args: { threadId: v.id("threads") },
    handler: async (ctx, args) => {
        return await ctx.db.query("leads")
            .filter((q) => q.eq(q.field("threadId"), args.threadId))
            .first();
    }
});

export const getLeadByUserId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;
        return await ctx.db.query("leads")
            .withIndex("by_telegramId", (q) => q.eq("telegramId", user.telegramId))
            .unique();
    }
});
