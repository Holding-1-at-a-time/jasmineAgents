import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

export const register = mutation({
  args: {
    telegramId: v.string(),
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    sourceCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_telegramId", (q) => q.eq("telegramId", args.telegramId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // 2. Create user (Traffic Origination / Scout Domain)
    const userId = await ctx.db.insert("users", {
      telegramId: args.telegramId,
      username: args.username,
      firstName: args.firstName,
      lastName: args.lastName,
      createdAt: Date.now(),
    });

    // 3. Handle Attribution (SPEC-16: Deterministic & Immutable)
    let finalSourceId = undefined;
    if (args.sourceCode) {
      const source = await ctx.db
        .query("sources")
        .withIndex("by_code", (q) => q.eq("code", args.sourceCode!))
        .first();

      if (source) {
          finalSourceId = source._id;
          console.log(`[Attribution] User ${userId} locked to source: ${args.sourceCode}`);
      }
    }

    // 4. Initialize Qualification State (Monotonic Lifecycle)
    await ctx.db.insert("qualification_state", {
        userId,
        currentState: "entry",
        history: [{ state: "entry", timestamp: Date.now(), reason: "Initial registration" }],
        entryTimestamp: Date.now(),
        updatedAt: Date.now(),
    });

    // 5. Create Initial Thread
    await ctx.db.insert("threads", {
      userId,
      state: "entry",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. Linked Lead Creation if source is present
    if (finalSourceId) {
        await ctx.db.insert("leads", {
            telegramId: args.telegramId,
            sourceId: finalSourceId as string,
            status: "new",
            metadata: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    }

    return userId;
  },
});

export const setLifecycleState = mutation({
    args: {
        userId: v.id("users"),
        newState: v.union(v.literal("entry"), v.literal("education"), v.literal("qualification"), v.literal("escalation")),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const state = await ctx.db
            .query("qualification_state")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
        
        if (!state) throw new Error("Qualification state not found");

        const order = ["entry", "education", "qualification", "escalation"];
        if (order.indexOf(args.newState) <= order.indexOf(state.currentState)) {
            console.log(`[Lifecycle] Rejecting non-monotonic transition: ${state.currentState} -> ${args.newState}`);
            return;
        }

        await ctx.db.patch(state._id, {
            currentState: args.newState,
            history: [...state.history, { state: args.newState, timestamp: Date.now(), reason: args.reason }],
            updatedAt: Date.now(),
        });

        console.log(`[Lifecycle] User ${args.userId} transitioned to ${args.newState}`);
    }
});

export const getByTelegramId = query({
  args: { telegramId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_telegramId", (q) => q.eq("telegramId", args.telegramId))
      .first();
  },
});

// SPEC-6: Workflow Context Loading
export const getLeadContext = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");
        
        // Mocking some attributes for the qualification logic
        return {
            hasPhoto: true, // In real scenario, check messages or files table
            hasBio: !!user.username,
        };
    },
});

// SPEC-6: State Transition
export const setQualified = internalMutation({
    args: { userId: v.id("users"), qualified: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            // We could add an isQualified field to user schema in next realignment
            // For now, we logging it. 
        });
        console.log(`[Qualification] User ${args.userId} state set to: ${args.qualified}`);
    }
});
