import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const createWorkflow = internalMutation({
  args: {
    agentId: v.string(),
    state: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workflows", {
      agentId: args.agentId,
      status: "running",
      state: args.state,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getWorkflow = internalQuery({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workflowId);
  },
});

export const updateWorkflowStatus = internalMutation({
  args: {
    workflowId: v.id("workflows"),
    status: v.union(v.literal("completed"), v.literal("failed"), v.literal("paused")),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.workflowId, {
      status: args.status,
      result: args.result,
      error: args.error,
      updatedAt: Date.now(),
    });
  },
});

export const getStep = internalQuery({
  args: {
    workflowId: v.id("workflows"),
    stepKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflow_steps")
      .withIndex("by_workflowId_stepKey", (q) =>
        q.eq("workflowId", args.workflowId).eq("stepKey", args.stepKey)
      )
      .first();
  },
});

export const logStepStart = internalMutation({
  args: {
    workflowId: v.id("workflows"),
    stepKey: v.string(),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("workflow_steps")
      .withIndex("by_workflowId_stepKey", (q) =>
        q.eq("workflowId", args.workflowId).eq("stepKey", args.stepKey)
      )
      .first();

    if (existing) {
       // already exists? maybe retrying. update to running if failed/pending
       if (existing.status !== "completed") {
           await ctx.db.patch(existing._id, { status: "running", updatedAt: Date.now() });
       }
       return existing._id;
    }

    return await ctx.db.insert("workflow_steps", {
      workflowId: args.workflowId,
      stepKey: args.stepKey,
      input: args.input,
      status: "running",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const logStepSuccess = internalMutation({
  args: {
    workflowId: v.id("workflows"),
    stepKey: v.string(),
    output: v.any(),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db
      .query("workflow_steps")
      .withIndex("by_workflowId_stepKey", (q) =>
        q.eq("workflowId", args.workflowId).eq("stepKey", args.stepKey)
      )
      .first();

    if (step) {
      await ctx.db.patch(step._id, {
        output: args.output,
        status: "completed",
        updatedAt: Date.now(),
      });
    }
  },
});

export const logStepFailure = internalMutation({
    args: {
      workflowId: v.id("workflows"),
      stepKey: v.string(),
      error: v.string(),
    },
    handler: async (ctx, args) => {
      const step = await ctx.db
        .query("workflow_steps")
        .withIndex("by_workflowId_stepKey", (q) =>
          q.eq("workflowId", args.workflowId).eq("stepKey", args.stepKey)
        )
        .first();
  
      if (step) {
        await ctx.db.patch(step._id, {
          status: "failed", // We don't store error message in step schema yet? 
          // Schema says input/output. Maybe generic 'output' can store error info or add error column. 
          // For now, let's just mark failed.
          updatedAt: Date.now(),
        });
      }
    },
  });
