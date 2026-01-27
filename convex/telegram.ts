import { v } from "convex/values";
import { internalAction, internalMutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const sendTelegramMessage = internalAction({
    args: {
        chatId: v.string(), // This is the Telegram UserId/ChatId
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const token = process.env.TELEGRAM_TOKEN;
        if (!token) throw new Error("TELEGRAM_TOKEN not set in environment");

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: args.chatId,
                text: args.text,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Telegram API error:", error);
            throw new Error(`Failed to send Telegram message: ${response.statusText}`);
        }

        console.log(`[Telegram] Message sent to ${args.chatId}`);
    },
});

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
        console.error(`User not found for telegramId: ${args.telegramId}`);
        return null;
    }

    const thread = await ctx.db
        .query("threads")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

    if (!thread) {
        console.error(`Thread not found for userId: ${user._id}`);
        return null;
    }

    await ctx.db.insert("messages", {
      threadId: thread._id,
      role: args.role,
      content: args.text,
      createdAt: Date.now(),
    });

    // Trigger Agent processing asynchronously
    if (args.role === "user") {
        await ctx.scheduler.runAfter(0, api.agents.ask, {
            threadId: thread._id,
            userMessage: args.text
        });
    }
  },
});

// SPEC-6: Monetization via Telegram Stars (XTR)
export const handleStarsPayment = internalMutation({
    args: {
        telegramId: v.string(),
        amount: v.number(),
        payload: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_telegramId", (q) => q.eq("telegramId", args.telegramId))
            .first();
            
        if (!user) throw new Error("User not found for payment");

        // Log transaction (would go to a payments table)
        console.log(`[Payment] Received ${args.amount} Stars from ${args.telegramId} for ${args.payload}`);
        
        // Fulfill order
        // e.g. ctx.db.patch(user._id, { premium: true });
    }
});

export const createInvoice = internalAction({
    args: {
        chatId: v.string(),
        title: v.string(),
        description: v.string(),
        payload: v.string(),
        currency: v.literal("XTR"),
        prices: v.array(v.object({ label: v.string(), amount: v.number() })),
    },
    handler: async (ctx, args) => {
        const token = process.env.TELEGRAM_TOKEN;
        if (!token) throw new Error("TELEGRAM_TOKEN not set");

        // Calls Telegram sendInvoice method
        console.log(`[Telegram] Creating invoice for ${args.chatId}: ${args.title}`);
        
        // Actual implementation would fetch https://api.telegram.org/bot${token}/sendInvoice
    }
});

export const listMessages = query({
    args: { threadId: v.id("threads") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
            .collect();
    }
});
