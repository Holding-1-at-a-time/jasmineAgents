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

    // 3. Handle Attribution (SPEC-6: Secure attribution via deep links)
    if (args.sourceCode) {
      const source = await ctx.db
        .query("sources")
        .withIndex("by_code", (q) => q.eq("code", args.sourceCode!))
        .first();

      if (source) {
          // Log attribution event (to be expanded with Scout specific logic)
          console.log(`[Attribution] User ${userId} joined from source: ${args.sourceCode}`);
      }
    }

    // 4. Create Initial Thread
    await ctx.db.insert("threads", {
      userId,
      state: "entry",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
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
