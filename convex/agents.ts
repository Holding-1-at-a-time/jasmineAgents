import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: process.env.OLLAMA_API_KEY || "ollama",
});

const DEFAULT_MODEL = process.env.OLLAMA_MODAL || "qwen3-vl:235b-cloud";
import { Agent } from "@convex-dev/agent";
import { v } from "convex/values";

import { scout } from "./agents/scout";
import { diplomat } from "./agents/diplomat";
import { nurturer } from "./agents/nurturer";
import { strategist } from "./agents/strategist";
import { analyst } from "./agents/analyst";

// SPEC-13: Canonical System Prompt
const CANONICAL_SYSTEM_PROMPT = `
You are an AI Agent operating inside a deterministic Convex-based system.
Your role is to:
- Reason about user intent
- Decide which deterministic tools to call
- Produce structured outputs when required

You are NOT allowed to:
- Assume access to memory
- Invent or modify state
- Retry failed operations
- Bypass tool usage

────────────────────────────
RE-ACT REASONING (REASON → ACT → OBSERVE)
────────────────────────────
1. REASON: Analyze the user input and current context. Detect missing info.
2. ACT: Call a tool only if you have a specific knowledge gap.
3. OBSERVE: Ingest the tool result and synthesize a grounded response.
- Use up to 5 steps to reach a grounded conclusion.
- Do NOT guess if you can search.

────────────────────────────
RECRUITMENT & GROUNDING
────────────────────────────
- Before qualifying a lead, you MUST call search_rules to verify agency standards.
- Use lookup_candidate to check if we already have data for this lead.
- Ground every response in retrieved facts.

────────────────────────────
MEMORY & DURABILITY
────────────────────────────
- If you need historical context, you MUST call search_context.
- Multi-step operations must be delegated to workflows via start_workflow.
- All state changes are managed by Convex mutations called by your tools.
`;

// Agent Registry Map (SPEC-4)
export const AGENTS: Record<string, Agent> = {
    scout,
    diplomat,
    nurturer,
    strategist,
    analyst
};

// SPEC-7: Observability & Tracing
export const recordTrace = internalMutation({
  args: {
    threadId: v.optional(v.id("threads")),
    workflowId: v.optional(v.id("workflows")),
    agentName: v.string(),
    stepKey: v.string(),
    model: v.optional(v.string()),
    input: v.any(),
    output: v.any(),
    rationale: v.optional(v.string()),
    usage: v.optional(v.object({
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number(),
    })),
    durationMs: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("traces", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Handoff mutation (SPEC-4)
export const handoff = internalMutation({
  args: {
    threadId: v.id("threads"),
    toAgent: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      console.error(`Thread ${args.threadId} not found for handoff`);
      return;
    }

    // Log handoff event (SPEC-7 Audit)
    await ctx.db.insert("audit_logs", {
        actor: "system",
        action: "handoff",
        entityId: args.threadId,
        entityType: "thread",
        diff: { from: thread.state, to: args.toAgent, reason: args.reason },
        createdAt: Date.now(),
    });

    await ctx.db.patch(args.threadId, {
      state: args.toAgent,
      updatedAt: Date.now(),
    });
  },
});

export const recordAuditLog = internalMutation({
  args: {
    actor: v.string(),
    action: v.string(),
    entityId: v.string(),
    entityType: v.string(),
    diff: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("audit_logs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// 1. Internal mutation...
export const sendMessage = internalMutation({
  args: {
    threadId: v.id("threads"),
    text: v.string(),
    role: v.literal("agent"),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Persist to DB
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
        console.error(`Thread ${args.threadId} not found`);
        return;
    }

    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      userId: thread.userId, // Denormalized for vector search
      role: args.role,
      content: args.text,
      createdAt: Date.now(),
    });
    
    // 2. Trigger asynchronous embedding (SPEC-10)
    await ctx.scheduler.runAfter(0, internal.memories.generateMessageEmbedding, {
        messageId,
    });

    // 3. Look up recipient Telegram ID
    if (!thread) {
        console.error(`Thread ${args.threadId} not found for outbound message`);
        return;
    }
    const user = await ctx.db.get(thread.userId);
    if (!user) {
        console.error(`User ${thread.userId} not found for thread ${args.threadId}`);
        return;
    }

    // 3. Schedule delivery via Telegram API
    // We run this after the mutation commits to ensure the message is saved first
    await ctx.scheduler.runAfter(0, internal.telegram.sendTelegramMessage, {
        chatId: user.telegramId,
        text: args.text
    });

    console.log(`[${args.agentName}] Message logged and scheduled for ${user.telegramId}`);
  },
});

// SPEC-13: Dispatcher Entry Point
export const ask = action({
  args: {
    threadId: v.id("threads"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Thread retrieval
    const thread = await ctx.runQuery(internal.agents.getThread, { threadId: args.threadId });
    if (!thread) throw new Error("Thread not found");

    // 2. Delegate to reasoning loop
    // In Phase 17, we use the centralized generateAgentResponse which supports ReAct cycles
    return await ctx.runAction(internal.agents.generateAgentResponse, {
        threadId: args.threadId,
        userMessage: args.userMessage,
    });
  },
});

export const emitSignal = internalMutation({
  args: {
    originator: v.string(),
    target: v.string(),
    type: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("signals", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    console.log(`[Signal] ${args.originator} -> ${args.target}: ${args.type}`);
  },
});

// SPEC-13: Advanced Reasoning Loop (generateAgentResponse)
export const generateAgentResponse = action({
  args: {
    threadId: v.id("threads"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const start = Date.now();
    const thread = await ctx.runQuery(internal.agents.getThread, { threadId: args.threadId });
    if (!thread) throw new Error("Thread not found");
    const lead = await ctx.runQuery(internal.leads.getLeadOfThread, { threadId: args.threadId });

    // Multi-turn tool calling loop
    const result = await generateText({
      model: ollama(DEFAULT_MODEL),
      system: CANONICAL_SYSTEM_PROMPT,
      prompt: `Lead ID: ${lead?._id ?? "unknown"} | Thread ID: ${args.threadId} | Latest Message: ${args.userMessage}`,
      tools: {
        search_context: tool({
          description: "Retrieve historical context using hybrid lexical and semantic search.",
          parameters: v.object({
            query: v.string(),
            mode: v.union(v.literal("lexical"), v.literal("semantic"), v.literal("hybrid")),
            limit: v.optional(v.number()),
          }),
          execute: async ({ query, mode, limit }) => {
            return await ctx.runAction(internal.memories.hybridSearch, {
              userId: thread.userId,
              query,
              threadId: args.threadId,
              mode,
              limit,
            });
          },
        }),
        lookup_entity: tool({
          description: "Retrieve deterministic system state (lead, user, thread, file metadata).",
          parameters: v.object({
            entityType: v.union(v.literal("lead"), v.literal("thread"), v.literal("user"), v.literal("file")),
            id: v.string(),
          }),
          execute: async ({ entityType, id }) => {
            if (entityType === "lead") return await ctx.runQuery(internal.leads.getLead, { leadId: id as Id<"leads"> });
            if (entityType === "thread") return await ctx.runQuery(internal.agents.getThread, { threadId: id as Id<"threads"> });
            if (entityType === "user") return await ctx.runQuery(internal.users.getUser, { userId: id as Id<"users"> });
            return { error: "Lookup not implemented for this type" };
          },
        }),
        lookup_candidate: tool({
          description: "Retrieve verified candidate CRM data and recruitment history.",
          parameters: v.object({
            leadId: v.string(),
          }),
          execute: async ({ leadId }) => {
            return await ctx.runQuery(internal.leads.getLead, { leadId: leadId as Id<"leads"> });
          },
        }),
        search_rules: tool({
          description: "Search for agency qualification standards and recruitment rules.",
          parameters: v.object({
            query: v.string(),
            namespace: v.union(v.literal("onboarding"), v.literal("platform_policies"), v.literal("earnings")),
          }),
          execute: async ({ query, namespace }) => {
            return await ctx.runAction(internal.knowledge.searchKnowledgeBase, { query, namespace });
          },
        }),
        verify_profile: tool({
          description: "Perform vision-based screening of model photos for aesthetics and compliance.",
          parameters: v.object({
            storageId: v.string(),
          }),
          execute: async ({ storageId }) => {
            // SPEC-14: Proxy to vision screening action
            return await ctx.runAction(internal.vision.screenPhotoAction, { 
                storageId: storageId as Id<"_storage">,
                leadId: lead?._id as Id<"leads">
            });
          },
        }),
        start_workflow: tool({
          description: "Initiate a durable, multi-step workflow.",
          parameters: v.object({
            workflowName: v.string(),
            payload: v.object({ leadId: v.string() }),
          }),
          execute: async ({ workflowName, payload }) => {
             if (workflowName === "nurture") {
                 await ctx.scheduler.runAfter(0, internal.workflows.leadNurtureWorkflow, { leadId: payload.leadId as Id<"leads"> });
                 return { status: "initiated", workflowName };
             }
             return { error: "Unknown workflow" };
          },
        }),
        escalate_to_human: tool({
          description: "Trigger human intervention for a candidate profile or complex query.",
          parameters: v.object({
            reason: v.string(),
            leadId: v.string(),
          }),
          execute: async ({ reason, leadId }) => {
            await ctx.runMutation(internal.agents.emitSignal, {
                originator: "NurturerAgent",
                target: "Manager",
                type: "escalation",
                payload: { reason, leadId }
            });
            return { status: "escalated", reason };
          },
        }),
        send_message: tool({
          description: "Send a message back to the Telegram user",
          parameters: v.object({
            text: v.string(),
          }),
          execute: async ({ text }) => {
            await ctx.runMutation(internal.agents.sendMessage, {
              threadId: args.threadId,
              text,
              role: "agent",
              agentName: "LeadMemoryAgent",
            });
            return { status: "sent" };
          },
        }),
      },
      maxSteps: 5,
    });

    // Record Trace for visibility (SPEC-7)
    await ctx.runMutation(internal.agents.recordTrace, {
      threadId: args.threadId,
      agentName: "LeadMemoryAgent",
      stepKey: "generate_response",
      model: DEFAULT_MODEL,
      input: { userMessage: args.userMessage },
      output: { reply: result.text, steps: result.steps.length },
      thinking: result.steps.map(s => ("thinking" in s ? (s as { thinking: string }).thinking : "")).filter(Boolean).join("\n"), // Capturing thinking
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
      durationMs: Date.now() - start,
    });

    return result.text;
  },
});

/**
 * SPEC-15: Persistent Text Streaming Action
 * Proxies AI SDK streams + synchronous DB journaling.
 */
export const streamAgentResponse = action({
  args: {
    threadId: v.id("threads"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Context loading
    const thread = await ctx.runQuery(internal.agents.getThread, { threadId: args.threadId });
    if (!thread) throw new Error("Thread not found");

    // 2. Stream generation
    // Note: We use streamText from AI SDK and manual chunk handling
    // for demonstration. In full component, we'd use useStream hooks.
    console.log(`[Stream] Starting persistent stream for thread ${args.threadId}`);

    // This is a stub for the heavy lifting:
    // const stream = await streamText({...});
    // for await (const chunk of stream.textStream) {
    //    await ctx.runMutation(internal.agents.appendMessageChunk, { threadId, chunk });
    // }

    return { status: "streaming_initiated" };
  }
});

export const getThread = query({
    args: { threadId: v.id("threads") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.threadId);
    }
});

// SPEC-7: Deterministic Replay Engine
export const replay = action({
  args: { traceId: v.id("traces") },
  handler: async (ctx, args) => {
    const trace = await ctx.runQuery(internal.agents.getTrace, { traceId: args.traceId });
    if (!trace) throw new Error("Trace not found");

    console.log(`[Replay] Replaying step: ${trace.stepKey} for agent: ${trace.agentName}`);
    
    // In a full implementation, this would re-invoke the agent logic
    // but inject the recorded tool outputs from the trace.
    return {
        originalOutput: trace.output,
        status: "replayed",
    };
  }
});

export const getTrace = query({
    args: { traceId: v.id("traces") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.traceId);
    }
});

// SPEC-7: Analyst Dashboard Metrics
export const getMetrics = query({
  args: { 
      agentName: v.optional(v.string()), 
      limit: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const tracesQuery = ctx.db.query("traces");
    
    const results = await tracesQuery.order("desc").take(args.limit ?? 100);
    
    const totalTokens = results.reduce((sum, t) => sum + (t.usage?.totalTokens ?? 0), 0);
    const avgDuration = results.length > 0 ? results.reduce((sum, t) => sum + t.durationMs, 0) / results.length : 0;
    
    return {
        count: results.length,
        totalTokens,
        avgDurationMs: Math.round(avgDuration),
        agentBreakdown: Array.from(new Set(results.map(r => r.agentName)))
            .map(name => ({
                name,
                count: results.filter(r => r.agentName === name).length
            }))
    };
  }
});
