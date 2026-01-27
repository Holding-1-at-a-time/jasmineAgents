import { ActionCtx, internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// This file would contain tools callable by the Agent component or the reasoning loop
// SPEC-10: search_context tool
export const search_context = {
    description: "Search historical messages and memories for relevant context using hybrid lexical and semantic retrieval.",
    parameters: v.object({
        query: v.string(),
    }),
    handler: async (ctx: ActionCtx, args: { query: string }, { userId }: { userId: string }) => {
        // We call the hybridSearch action from memories.ts
        const results = await ctx.runAction(internal.memories.hybridSearch, {
            userId: userId as any, // Cast to any because it's a string from context but id from the action args
            query: args.query,
        });

        return {
            results: results.map(r => ({
                content: r.content,
                role: r.role,
                score: r.score,
            })),
        };
    }
};

// ... other tools (accountLookup, etc. as mentioned in specs)
