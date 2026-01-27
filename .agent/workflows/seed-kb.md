---
description: Populate the RAG knowledge base with agency rules and policies.
---

1. **Review Rules Data**
   Open `convex/knowledge.ts` and verify the content of `seedKnowledgeBase`.

2. **Wait for Ollama Availability**
   Ensure your Ollama endpoint (configured in `OLLAMA_BASE_URL`) is reachable for embedding generation.

3. **Run Seeding Mutation**
   Execute the mutation to upsert knowledge items and their vector embeddings into Convex.
   // turbo
   `npx convex mutation knowledge:seedKnowledgeBase`

4. **Verify Vector Indexes**
   Check the Convex health dashboard to ensure the `by_embedding` index on the `knowledge_base` table is fully backfilled.
