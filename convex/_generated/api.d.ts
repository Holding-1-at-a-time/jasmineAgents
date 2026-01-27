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
import type * as analytics from "../analytics.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as knowledge from "../knowledge.js";
import type * as leads from "../leads.js";
import type * as lib_agent from "../lib/agent.js";
import type * as lib_ai from "../lib/ai.js";
import type * as lib_types from "../lib/types.js";
import type * as lib_workflow from "../lib/workflow.js";
import type * as maintenance from "../maintenance.js";
import type * as memories from "../memories.js";
import type * as payments from "../payments.js";
import type * as sharding from "../sharding.js";
import type * as solver from "../solver.js";
import type * as sources from "../sources.js";
import type * as telegram from "../telegram.js";
import type * as testing from "../testing.js";
import type * as tools from "../tools.js";
import type * as users from "../users.js";
import type * as vision from "../vision.js";
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
  analytics: typeof analytics;
  files: typeof files;
  http: typeof http;
  knowledge: typeof knowledge;
  leads: typeof leads;
  "lib/agent": typeof lib_agent;
  "lib/ai": typeof lib_ai;
  "lib/types": typeof lib_types;
  "lib/workflow": typeof lib_workflow;
  maintenance: typeof maintenance;
  memories: typeof memories;
  payments: typeof payments;
  sharding: typeof sharding;
  solver: typeof solver;
  sources: typeof sources;
  telegram: typeof telegram;
  testing: typeof testing;
  tools: typeof tools;
  users: typeof users;
  vision: typeof vision;
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
