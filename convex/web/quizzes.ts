import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Admin: Get all quizzes with full details
export const getAllQuizzes = query({
  handler: async (ctx) => {
    return await ctx.db.query("quizzes").collect();
  },
});

// Admin: Get quiz by ID
export const getQuizById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_quiz_id", (q) => q.eq("id", args.id))
      .first();
  },
});

// Admin: Get quizzes by category
export const getQuizzesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Admin: Create new quiz
export const createQuiz = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if quiz with this ID already exists
    const existing = await ctx.db
      .query("quizzes")
      .withIndex("by_quiz_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      throw new Error(`Quiz with ID ${args.id} already exists`);
    }

    const now = Date.now();
    return await ctx.db.insert("quizzes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Admin: Update existing quiz
export const updateQuiz = mutation({
  args: {
    _id: v.id("quizzes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    duration: v.optional(v.number()),
    questions: v.optional(
      v.array(
        v.object({
          id: v.string(),
          question: v.string(),
          options: v.array(v.string()),
          correctAnswer: v.number(),
          explanation: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { _id, ...updates } = args;
    
    await ctx.db.patch(_id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return _id;
  },
});

// Admin: Delete quiz
export const deleteQuiz = mutation({
  args: { _id: v.id("quizzes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args._id);
    return { success: true };
  },
});

// Admin: Get all categories
export const getAllCategories = query({
  handler: async (ctx) => {
    const quizzes = await ctx.db.query("quizzes").collect();
    const categories = new Set(quizzes.map((quiz) => quiz.category));
    return Array.from(categories);
  },
});

// Admin: Get quiz statistics
export const getQuizStats = query({
  handler: async (ctx) => {
    const quizzes = await ctx.db.query("quizzes").collect();
    
    const totalQuizzes = quizzes.length;
    const byCategory = quizzes.reduce((acc, quiz) => {
      acc[quiz.category] = (acc[quiz.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byDifficulty = quizzes.reduce((acc, quiz) => {
      acc[quiz.difficulty] = (acc[quiz.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuizzes,
      byCategory,
      byDifficulty,
    };
  },
});

// Admin: Bulk create quizzes (useful for seeding)
export const bulkCreateQuizzes = mutation({
  args: {
    quizzes: v.array(
      v.object({
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
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];

    for (const quiz of args.quizzes) {
      const _id = await ctx.db.insert("quizzes", {
        ...quiz,
        createdAt: now,
        updatedAt: now,
      });
      results.push(_id);
    }

    return { success: true, count: results.length, ids: results };
  },
});

// Admin: Bulk create quizzes with automatic category tracking
export const bulkCreateQuizzesWithCategories = mutation({
  args: {
    quizzes: v.array(
      v.object({
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
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Extract unique categories from quizzes
    const uniqueCategories = Array.from(
      new Set(args.quizzes.map((quiz) => quiz.category))
    );

    // Ensure all categories exist in the categories table
    for (const categoryName of uniqueCategories) {
      // Check if category already exists
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_name", (q) => q.eq("name", categoryName))
        .first();

      if (!existing) {
        // Create slug from category name
        const slug = categoryName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");

        await ctx.db.insert("categories", {
          name: categoryName,
          slug,
          description: undefined,
          icon: undefined,
          color: undefined,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Insert all quizzes
    const results = [];
    for (const quiz of args.quizzes) {
      const _id = await ctx.db.insert("quizzes", {
        ...quiz,
        createdAt: now,
        updatedAt: now,
      });
      results.push(_id);
    }

    return { 
      success: true, 
      quizCount: results.length, 
      categoryCount: uniqueCategories.length,
      categories: uniqueCategories,
      ids: results 
    };
  },
});
