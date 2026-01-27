import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const testReActLoop = action({
  args: {
    telegramId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Ensure user exists
    let user = await ctx.runQuery(internal.users.getByTelegramId, { telegramId: args.telegramId });
    if (!user) {
        await ctx.runMutation(internal.users.register, {
            telegramId: args.telegramId,
            username: "test_user",
        });
        user = await ctx.runQuery(internal.users.getByTelegramId, { telegramId: args.telegramId });
    }

    if (!user) throw new Error("Failed to create/find test user");

    // 2. Ensure thread exists
    let thread = await ctx.runQuery(internal.users.getLeadContext, { userId: user._id });
    if (!thread) {
       // Registration should have created it, but just in case
       throw new Error("Thread not found for user");
    }

    // 3. Trigger Reasoning Loop
    console.log(`[TEST] Triggering ReAct loop for context-gap: "${args.message}"`);
    const response = await ctx.runAction(internal.agents.generateAgentResponse, {
        threadId: thread.threadId as any,
        userMessage: args.message,
    });

    return {
        response,
        threadId: thread.threadId,
    };
  },
});
