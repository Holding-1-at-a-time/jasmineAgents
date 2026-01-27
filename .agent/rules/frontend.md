---
trigger: "editing next.js pages, components, or api routes"
---

1. **Async Dynamic APIs**:
   - `params`, `searchParams`, `cookies()`, and `headers()` MUST be awaited before use.
   - Example: `const { slug } = await params;`.
2. **Partial Prerendering (PPR)**:
   - Default to static shells with dynamic islands using `<Suspense>`.
   - Prefer PPR over full Server-Side Rendering (SSR) for low-latency delivery.
3. **Server/Client Boundaries**:
   - Keep data fetching logic in Server Components.
   - Use Client Components ONLY for interactivity (e.g., `useSmoothText`, forms).
   - Use `proxy.ts` for intercepting and routing Node.js level requests.
4. **Authoritative State**:
   - Authorized state must be fetched on the server via `fetchQuery`.
   - Use `useQuery` only for optimistic UI or non-critical state updates.
5. **Streaming UI**:
   - Implement "Premium Typing" experience for agent replies using `useSmoothText`.
   - Ensure the UI remains responsive during long-running background actions.
6. **SEO Best Practices**:
   - Every page must have a descriptive title and meta description.
   - Use semantic HTML with unique IDs for interactive elements.
