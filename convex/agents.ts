import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Agent } from "@convex-dev/agent";

import { scout } from "./agents/scout";
import { diplomat } from "./agents/diplomat";
import { nurturer } from "./agents/nurturer";
import { strategist } from "./agents/strategist";
import { analyst } from "./agents/analyst";

// Agent Registry Map
const AGENTS: Record<string, Agent> = {
    scout,
    diplomat,
    nurturer,
    strategist,
    analyst
};

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
    await ctx.db.insert("messages", {
      threadId: args.threadId,
      role: args.role,
      content: args.text,
      createdAt: Date.now(),
    });
    
    // 2. Look up recipient Telegram ID
    const thread = await ctx.db.get(args.threadId);
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

// ... Handoff ... (unchanged)

// 3. The Central Dispatcher (Reasoning Loop)
export const ask = action({
  args: { 
      threadId: v.id("threads"), 
      userMessage: v.string() 
  },
  handler: async (ctx, args) => {
     // Determine active agent based on thread state
     const currentAgentName = "scout"; 
     const agent = AGENTS[currentAgentName];

     if (!agent) throw new Error(`Agent ${currentAgentName} not found in registry`);

     console.log(`[Dispatcher] Routing to ${currentAgentName}`);

     // Note: Real implementation would be `await agent.run(ctx, { threadId: args.threadId })`
     // If the Agent component supports it. For now, simulated response.
     const reply = `[${currentAgentName}] Acknowledged. SPEC-4 boundaries enforced.`;

     await ctx.runMutation(internal.agents.sendMessage, {
         threadId: args.threadId,
         text: reply,
         role: "agent",
         agentName: currentAgentName
     });
     
     return reply;
  }
});
