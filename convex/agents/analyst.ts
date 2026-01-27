import { Agent } from "@convex-dev/agent";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Analyst: Measurement & optimization
// Owns: Funnel metrics, policy tuning
export const analyst = new Agent({
  name: "analyst",
  tools: [
    {
      name: "get_funnel_metrics",
      description: "Retrieve high-precision funnel state from the qualification lifecycle.",
      parameters: v.object({}),
      handler: async (ctx) => {
          return await ctx.runQuery(api.analytics.getFunnelMetrics, {});
      }
    },
    {
      name: "rank_sources",
      description: "Rank conversion sources by conversion rate and volume.",
      parameters: v.object({}),
      handler: async (ctx) => {
          return await ctx.runQuery(api.analytics.getSourcePerformance, {});
      }
    },
    {
      name: "recalibrate_system",
      description: "Emit optimization directives to Scout or Strategist agents.",
      parameters: v.object({
          target: v.union(v.literal("scout"), v.literal("strategist")),
          type: v.string(),
          payload: v.any(),
      }),
      handler: async (ctx, args) => {
          await ctx.runMutation(internal.agents.emitSignal, {
              originator: "analyst",
              target: args.target,
              type: args.type,
              payload: args.payload,
          });
          return { status: "signal_emitted", target: args.target };
      }
    }
  ],
});
