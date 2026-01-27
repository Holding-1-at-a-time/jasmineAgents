import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * SPEC-16: Analytics & Funnel Queries
 * These are deterministic read-only operations for the Analyst Agent.
 */

export const getFunnelMetrics = query({
  args: {},
  handler: async (ctx) => {
    const states = ["entry", "education", "qualification", "escalation"];
    const metrics: Record<string, number> = {};

    for (const state of states) {
        const count = await ctx.db
            .query("qualification_state")
            .filter(q => q.eq(q.field("currentState"), state))
            .collect();
        metrics[state] = count.length;
    }

    return metrics;
  }
});

export const getSourcePerformance = query({
    args: {},
    handler: async (ctx) => {
        const sources = await ctx.db.query("sources").collect();
        const performance = [];

        for (const source of sources) {
            const leads = await ctx.db
                .query("leads")
                .withIndex("by_status", (q) => q)
                .filter(q => q.eq(q.field("sourceId"), source._id))
                .collect();
            
            const qualifiedCount = leads.filter(l => ["qualified", "nurtured", "escalated"].includes(l.status)).length;
            const conversionRate = leads.length > 0 ? (qualifiedCount / leads.length) : 0;

            performance.push({
                sourceId: source.code,
                platform: source.channel,
                totalLeads: leads.length,
                qualifiedLeads: qualifiedCount,
                conversionRate,
            });
        }

        return performance.sort((a, b) => b.conversionRate - a.conversionRate);
    }
});

export const getAgentPerformance = query({
  args: { agentName: v.string() },
  handler: async (ctx, args) => {
    const traces = await ctx.db.query("traces")
        .filter(q => q.eq(q.field("agentName"), args.agentName))
        .collect();
    
    const totalTokens = traces.reduce((sum, t) => sum + (t.usage?.totalTokens ?? 0), 0);
    const avgDuration = traces.length > 0 ? traces.reduce((sum, t) => sum + t.durationMs, 0) / traces.length : 0;

    return {
        invocations: traces.length,
        totalTokens,
        avgDurationMs: Math.round(avgDuration),
    };
  }
});
