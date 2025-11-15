/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as mobile_notifications from "../mobile/notifications.js";
import type * as mobile_quizzes from "../mobile/quizzes.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as web_categories from "../web/categories.js";
import type * as web_notifications from "../web/notifications.js";
import type * as web_quizzes from "../web/quizzes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "mobile/notifications": typeof mobile_notifications;
  "mobile/quizzes": typeof mobile_quizzes;
  pushNotifications: typeof pushNotifications;
  seed: typeof seed;
  users: typeof users;
  "web/categories": typeof web_categories;
  "web/notifications": typeof web_notifications;
  "web/quizzes": typeof web_quizzes;
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
