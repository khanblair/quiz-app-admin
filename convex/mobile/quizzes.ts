import { v } from "convex/values";
import { query } from "../_generated/server";

// Mobile: Get all quizzes (read-only)
export const getAllQuizzes = query({
  handler: async (ctx) => {
    return await ctx.db.query("quizzes").collect();
  },
});

// Mobile: Get quiz by ID (read-only)
export const getQuizById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_quiz_id", (q) => q.eq("id", args.id))
      .first();
  },
});

// Mobile: Get quizzes by category (read-only)
export const getQuizzesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Mobile: Get quizzes by difficulty (read-only)
export const getQuizzesByDifficulty = query({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

// Mobile: Get all categories (read-only)
export const getAllCategories = query({
  handler: async (ctx) => {
    const quizzes = await ctx.db.query("quizzes").collect();
    const categories = new Set(quizzes.map((quiz) => quiz.category));
    return Array.from(categories);
  },
});

// Mobile: Search quizzes by title or description
export const searchQuizzes = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allQuizzes = await ctx.db.query("quizzes").collect();
    const searchLower = args.searchTerm.toLowerCase();
    
    return allQuizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(searchLower) ||
        quiz.description.toLowerCase().includes(searchLower)
    );
  },
});

// Mobile: Get quiz count by category
export const getQuizCountByCategory = query({
  handler: async (ctx) => {
    const quizzes = await ctx.db.query("quizzes").collect();
    
    const counts = quizzes.reduce((acc, quiz) => {
      acc[quiz.category] = (acc[quiz.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  },
});
