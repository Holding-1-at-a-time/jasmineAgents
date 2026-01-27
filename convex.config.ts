import { defineApp } from "convex/server";
import { agent } from "@convex-dev/agent/convex.config";
import { workflow } from "@convex-dev/workflow/convex.config";
import { rag } from "@convex-dev/rag/convex.config";
import { rateLimiter } from "@convex-dev/rate-limiter/convex.config";
import { actionCache } from "@convex-dev/action-cache/convex.config";

export default defineApp((app) => {
  app.use(agent, {
    // Optional: customize agent schema or behavior if supported by the component
    // For now, default registration
  });
  
  app.use(workflow, {
    // Durable workflows
  });

  app.use(rag, {
    // RAG for memory
  });

  app.use(rateLimiter, {
    // Rate limiting
  });

  app.use(actionCache, {
    // Caching for LLM/embeddings
  });
});
