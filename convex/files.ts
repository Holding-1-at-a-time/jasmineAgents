import { v } from "convex/values";
import { action, mutation } from "./_generated/server";

// SPEC-6: Media Management (External Storage Primitives)
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    // Generates a URL for the client to upload a file (Convex Storage)
    // For external S3, this would involve AWS SDK.
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
    args: {
        storageId: v.string(),
        threadId: v.id("threads"),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const fileId = await ctx.db.insert("files", {
            storageId: args.storageId,
            threadId: args.threadId,
            name: args.name,
            deleted: false,
            createdAt: Date.now(),
        });
        return fileId;
    }
});
