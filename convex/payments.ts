import { action, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * SPEC-15: Sovereign Monetization (Telegram Stars)
 */

export const createStarInvoice = mutation({
  args: { 
    userId: v.id("users"),
    amount: v.number(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Record pending transaction
    const transactionId = await ctx.db.insert("star_transactions", {
      userId: args.userId,
      amount: args.amount,
      itemId: args.itemId,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { transactionId, status: "pending" };
  }
});

export const fulfillStarTransaction = internalMutation({
    args: { transactionId: v.id("star_transactions") },
    handler: async (ctx, args) => {
        const tx = await ctx.db.get(args.transactionId);
        if (!tx) throw new Error("Transaction not found");

        await ctx.db.patch(args.transactionId, {
            status: "completed",
            updatedAt: Date.now(),
        });

        console.log(`[Payments] Transaction ${args.transactionId} fulfilled for user ${tx.userId}`);
    }
});

export const verifyStarPayment = action({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    // In production, this would verify the Telegram payment hash
    console.log("[Monetization] Verifying Star Payment", args.payload);
    return { success: true };
  }
});
