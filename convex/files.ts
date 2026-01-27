import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * SPEC-12: Files & Media Interaction
 */

export const registerFile = internalMutation({
  args: {
    storageId: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
        ...args,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
  }
});

export const getFile = query({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("files")
            .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
            .first();
    }
});

export const getUploadUrl = action({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    }
});

export const softDeleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    await ctx.db.patch(args.fileId, {
        status: "deleted",
        deletedAt: Date.now(),
    });
  }
});

// Implementation of pre-signed URLs would go in an action
