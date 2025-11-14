import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Get all categories
export const getAllCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("desc").collect();
  },
});

// Get category by slug
export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get category by name
export const getCategoryByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Create category
export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Category with slug "${args.slug}" already exists`);
    }

    const now = Date.now();
    return await ctx.db.insert("categories", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update category
export const updateCategory = mutation({
  args: {
    _id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { _id, ...updates } = args;

    const slug = updates.slug;
    if (typeof slug === "string" && slug.length > 0) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (existing && existing._id !== _id) {
        throw new Error(`Category with slug "${slug}" already exists`);
      }
    }

    await ctx.db.patch(_id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return _id;
  },
});

// Delete category
export const deleteCategory = mutation({
  args: { _id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args._id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if any quizzes use this category
    const quizzesWithCategory = await ctx.db
      .query("quizzes")
      .withIndex("by_category", (q) => q.eq("category", category.name))
      .collect();

    if (quizzesWithCategory.length > 0) {
      throw new Error(
        `Cannot delete category "${category.name}" because ${quizzesWithCategory.length} quiz(zes) are using it`
      );
    }

    await ctx.db.delete(args._id);
    return { success: true };
  },
});

// Get category statistics
export const getCategoryStats = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const quizzes = await ctx.db.query("quizzes").collect();

    const stats = categories.map((category) => {
      const quizCount = quizzes.filter((q) => q.category === category.name).length;
      return {
        ...category,
        quizCount,
      };
    });

    return {
      total: categories.length,
      categories: stats,
    };
  },
});

// Bulk create categories
export const bulkCreateCategories = mutation({
  args: {
    categories: v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    const errors = [];

    for (const category of args.categories) {
      try {
        const existing = await ctx.db
          .query("categories")
          .withIndex("by_slug", (q) => q.eq("slug", category.slug))
          .first();

        if (existing) {
          errors.push(`Category "${category.name}" already exists`);
          continue;
        }

        const _id = await ctx.db.insert("categories", {
          ...category,
          createdAt: now,
          updatedAt: now,
        });
        results.push(_id);
      } catch (error) {
        errors.push(`Error creating "${category.name}": ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      created: results.length,
      errors,
      ids: results,
    };
  },
});
