/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent_test_agent from "../agent/test_agent.js";
import type * as agents from "../agents.js";
import type * as agents_analyst from "../agents/analyst.js";
import type * as agents_diplomat from "../agents/diplomat.js";
import type * as agents_nurturer from "../agents/nurturer.js";
import type * as agents_scout from "../agents/scout.js";
import type * as agents_strategist from "../agents/strategist.js";
import type * as lib_agent from "../lib/agent.js";
import type * as lib_ai from "../lib/ai.js";
import type * as lib_types from "../lib/types.js";
import type * as lib_workflow from "../lib/workflow.js";
import type * as memories from "../memories.js";
import type * as solver from "../solver.js";
import type * as sources from "../sources.js";
import type * as telegram from "../telegram.js";
import type * as users from "../users.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agent/test_agent": typeof agent_test_agent;
  agents: typeof agents;
  "agents/analyst": typeof agents_analyst;
  "agents/diplomat": typeof agents_diplomat;
  "agents/nurturer": typeof agents_nurturer;
  "agents/scout": typeof agents_scout;
  "agents/strategist": typeof agents_strategist;
  "lib/agent": typeof lib_agent;
  "lib/ai": typeof lib_ai;
  "lib/types": typeof lib_types;
  "lib/workflow": typeof lib_workflow;
  memories: typeof memories;
  solver: typeof solver;
  sources: typeof sources;
  telegram: typeof telegram;
  users: typeof users;
  workflows: typeof workflows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
