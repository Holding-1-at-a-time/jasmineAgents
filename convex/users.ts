import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

    // 2. Create user (Idempotent check handled above, but OCC handles race conditions)
    const userId = await ctx.db.insert("users", {
      telegramId: args.telegramId,
      username: args.username,
      firstName: args.firstName,
      lastName: args.lastName,
      createdAt: Date.now(),
    });

    // 3. Handle Attribution (if source code provided)
    if (args.sourceCode) {
      // We will perform a detailed attribution log in a separate internal mutation
      // or just trust the sourceCode is valid for now.
      // Ideally, we look up the source to validate it.
      const source = await ctx.db
        .query("sources")
        .withIndex("by_code", (q) => q.eq("code", args.sourceCode!))
        .first();

      if (source) {
        // Logic to link user to source can be expanded here.
        // For now, we are just creating the user.
        // We might want to store "sourceId" on the user if we add that field,
        // or just rely on the "entry" conversation state to track it.
      }
    }

    // 4. Create Initial Conversation
    await ctx.db.insert("conversations", {
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
