import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// SPEC-11: LeadPipe Endpoint for MTProto events
http.route({
  path: "/leadpipe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Basic security check (Secret Token)
    const secret = request.headers.get("X-LeadPipe-Secret");
    if (secret !== process.env.LEADPIPE_SECRET) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { telegramId, sourceId, metadata } = body;

    if (!telegramId) {
        return new Response("Bad Request: Missing telegramId", { status: 400 });
    }

    // 2. Ingest lead into Convex
    await ctx.runMutation(internal.leads.ingestLead, {
        telegramId: String(telegramId),
        sourceId,
        metadata: metadata ?? {},
    });

    return new Response("OK", { status: 200 });
  }),
});

// Telegram Bot Webhook (Placeholder/Template)
http.route({
  path: "/telegram",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // HMAC validation of X-Telegram-Bot-Api-Secret-Token would go here
    // const body = await request.json();
    
    // Process update...
    
    return new Response("OK", { status: 200 });
  }),
});

// SPEC-14: File Handling
http.route({
  path: "/fs/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const blob = await request.blob();
    const storageId = await ctx.storage.store(blob);
    
    // Using internal mutation to register metadata
    await ctx.runMutation(internal.files.registerFile, {
        storageId,
        name: request.headers.get("X-File-Name") || "upload",
        type: request.headers.get("Content-Type") || "application/octet-stream",
        size: blob.size,
    });
    
    return new Response(JSON.stringify({ storageId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/fs/download",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId");
    if (!storageId) return new Response("Missing storageId", { status: 400 });
    
    const url = await ctx.storage.getUrl(storageId);
    if (!url) return new Response("File not found", { status: 404 });
    
    return Response.redirect(url);
  }),
});

export default http;
