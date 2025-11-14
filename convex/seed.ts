import { mutation } from "./_generated/server";
import quizzesData from "../assets/data/quizzes.json";

export const seedQuizzes = mutation({
  handler: async (ctx) => {
    // Check if quizzes already exist
    const existingQuizzes = await ctx.db.query("quizzes").collect();
    
    if (existingQuizzes.length > 0) {
      return { 
        success: false, 
        message: "Database already has quizzes. Clear the database first if you want to reseed.",
        existingCount: existingQuizzes.length 
      };
    }

    const now = Date.now();

    // Extract unique categories from quizzes
    const uniqueCategories = Array.from(
      new Set(quizzesData.map((quiz: any) => quiz.category))
    );

    // Seed categories first
    const categoryMap: { [key: string]: string } = {};
    for (const categoryName of uniqueCategories) {
      // Check if category already exists
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_name", (q) => q.eq("name", categoryName))
        .first();

      if (existing) {
        categoryMap[categoryName] = existing._id;
      } else {
        // Create slug from category name
        const slug = categoryName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");

        const categoryId = await ctx.db.insert("categories", {
          name: categoryName,
          slug,
          description: undefined,
          icon: undefined,
          color: undefined,
          createdAt: now,
          updatedAt: now,
        });
        categoryMap[categoryName] = categoryId;
      }
    }

    // Seed quizzes
    const results = [];
    for (const quiz of quizzesData) {
      const _id = await ctx.db.insert("quizzes", {
        ...quiz,
        createdAt: now,
        updatedAt: now,
      });
      results.push(_id);
    }

    return { 
      success: true, 
      message: `Successfully seeded ${results.length} quizzes and ${uniqueCategories.length} categories`,
      quizCount: results.length,
      categoryCount: uniqueCategories.length,
      categories: uniqueCategories
    };
  },
});

export const clearAllQuizzes = mutation({
  handler: async (ctx) => {
    const allQuizzes = await ctx.db.query("quizzes").collect();
    const allCategories = await ctx.db.query("categories").collect();
    
    for (const quiz of allQuizzes) {
      await ctx.db.delete(quiz._id);
    }

    for (const category of allCategories) {
      await ctx.db.delete(category._id);
    }

    return { 
      success: true, 
      message: `Deleted ${allQuizzes.length} quizzes and ${allCategories.length} categories`,
      quizCount: allQuizzes.length,
      categoryCount: allCategories.length
    };
  },
});
