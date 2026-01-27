import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    code: v.string(),
    channel: v.string(), // e.g., "x_ad_1"
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sources")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("sources", {
      code: args.code,
      channel: args.channel,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

export const resolve = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sources")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});
