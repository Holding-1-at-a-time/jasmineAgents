import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const logMessage = internalMutation({
  args: {
    telegramId: v.string(),
    text: v.string(),
    role: v.union(v.literal("user"), v.literal("agent")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_telegramId", (q) => q.eq("telegramId", args.telegramId))
      .first();

    if (!user) {
        // In a real scenario, we might auto-create, but typically /start handles creation
        // and subsequent messages require a user.
        // For robustness, we could throw or log an error.
        console.error(`User not found for telegramId: ${args.telegramId}`);
        return null;
    }

    const conversation = await ctx.db
        .query("conversations")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

    if (!conversation) {
        console.error(`Conversation not found for userId: ${user._id}`);
        return null;
    }

    await ctx.db.insert("messages", {
      conversationId: conversation._id,
      role: args.role,
      content: args.text,
      createdAt: Date.now(),
    });
  },
});
