import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.string(), // "admin" or "user"
    pushToken: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.number(),
  }).index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_push_token", ["pushToken"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"])
    .index("by_slug", ["slug"]),

  quizzes: defineTable({
    id: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    difficulty: v.string(),
    duration: v.number(),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        options: v.array(v.string()),
        correctAnswer: v.number(),
        explanation: v.string(),
      })
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_quiz_id", ["id"])
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"]),

  notifications: defineTable({
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    read: v.boolean(),
    quizId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_created", ["createdAt"]),
});
