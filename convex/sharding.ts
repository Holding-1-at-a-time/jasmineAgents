import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * SPEC-14: Sharding for Throughput
 * Generic sharded counter using "Power of Two" load balancing.
 */

const DEFAULT_SHARD_COUNT = 10;

export const incrementShard = internalMutation({
  args: {
    key: v.string(),
    value: v.number(),
    shardCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const numShards = args.shardCount ?? DEFAULT_SHARD_COUNT;
    
    // Choose two random shards and pick the one with better state (or just one random for counters)
    const shardId = Math.floor(Math.random() * numShards);
    
    const existing = await ctx.db
        .query("shards")
        .withIndex("by_key_shardId", (q) => q.eq("key", args.key).eq("shardId", shardId))
        .unique();
    
    if (existing) {
        await ctx.db.patch(existing._id, {
            value: existing.value + args.value,
            updatedAt: Date.now(),
        });
    } else {
        await ctx.db.insert("shards", {
            key: args.key,
            shardId,
            value: args.value,
            updatedAt: Date.now(),
        });
    }
  }
});

export const getCount = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const shards = await ctx.db
        .query("shards")
        .filter(q => q.eq(q.field("key"), args.key))
        .collect();
    
    return shards.reduce((sum, s) => sum + s.value, 0);
  }
});

/**
 * Sharded Rate Limiter (Power of Two)
 */
export const checkRateLimit = internalMutation({
  args: {
    key: v.string(),
    limit: v.number(),
    shardCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const numShards = args.shardCount ?? DEFAULT_SHARD_COUNT;
    
    // Power of Two: Pick two, choose the one with more capacity
    const s1 = Math.floor(Math.random() * numShards);
    const s2 = Math.floor(Math.random() * numShards);
    
    const shard1 = await ctx.db
        .query("shards")
        .withIndex("by_key_shardId", (q) => q.eq("key", args.key).eq("shardId", s1))
        .unique();
    const shard2 = await ctx.db
        .query("shards")
        .withIndex("by_key_shardId", (q) => q.eq("key", args.key).eq("shardId", s2))
        .unique();
    
    const v1 = shard1?.value ?? 0;
    const v2 = shard2?.value ?? 0;
    
    // If combined total is needed, this simple approach works for occupancy
    // But usually rate limiters use a shared window.
    // This is a simplified "Occupancy" counter for throughput limit.
    
    if (v1 < v2) {
        if (v1 < args.limit) {
            await ctx.runMutation(internal.sharding.incrementShard, { key: args.key, value: 1 });
            return { allowed: true };
        }
    } else {
         if (v2 < args.limit) {
            await ctx.runMutation(internal.sharding.incrementShard, { key: args.key, value: 1 });
            return { allowed: true };
        }
    }
    
    return { allowed: false };
  }
});

/**
 * SPEC-15: Sharded Token Bucket
 * For high-precision, high-throughput credit management (e.g. LLM tokens).
 */
export const consumeTokens = internalMutation({
  args: {
    key: v.string(),
    amount: v.number(),
    capacity: v.number(),
    refillRate: v.number(), // tokens per ms
  },
  handler: async (ctx, args) => {
    const shardId = Math.floor(Math.random() * DEFAULT_SHARD_COUNT);
    const existing = await ctx.db
        .query("shards")
        .withIndex("by_key_shardId", (q) => q.eq("key", args.key).eq("shardId", shardId))
        .unique();

    const now = Date.now();
    let tokens = args.capacity;

    if (existing) {
        const timePassed = now - existing.updatedAt;
        tokens = Math.min(args.capacity, existing.value + timePassed * args.refillRate);
    }

    if (tokens >= args.amount) {
        const newValue = tokens - args.amount;
        if (existing) {
            await ctx.db.patch(existing._id, { value: newValue, updatedAt: now });
        } else {
            await ctx.db.insert("shards", { key: args.key, shardId, value: newValue, updatedAt: now });
        }
        return { allowed: true, remaining: newValue };
    }

    return { allowed: false, remaining: tokens };
  }
});
