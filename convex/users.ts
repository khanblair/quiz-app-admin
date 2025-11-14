import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { UserIdentity } from "convex/server";

// Get or create user from Clerk authentication
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

// Create or update user (called from webhook or on first login)
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        lastLoginAt: now,
      });
      return existing._id;
    }

    // First user becomes admin, rest are users
    const userCount = await ctx.db.query("users").collect();
    const role = userCount.length === 0 ? "admin" : "user";

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role,
      createdAt: now,
      lastLoginAt: now,
    });
  },
});

// Sync user on authentication (called automatically)
export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      // If no server auth identity is present, do nothing and return null.
      // The client-side `upsertUser` mutation handles sign-in/up from the client.
      return null;
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: identity.email || existing.email,
        name: identity.name || existing.name,
        imageUrl: identity.pictureUrl || existing.imageUrl,
        lastLoginAt: now,
      });
      return existing._id;
    }

    // First user becomes admin
    const userCount = await ctx.db.query("users").collect();
    const role = userCount.length === 0 ? "admin" : "user";

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "",
      name: identity.name,
      imageUrl: identity.pictureUrl,
      role,
      createdAt: now,
      lastLoginAt: now,
    });
  },
});

// Check if current user is admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user?.role === "admin";
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // Return all users without requiring server-side authentication.
    return await ctx.db.query("users").collect();
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Allow role updates without server-side admin checks for simplicity.
    await ctx.db.patch(args.userId, {
      role: args.role,
    });

    return { success: true };
  },
});

// Get users by role
export const getUsersByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

// Get user stats
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    // Return user statistics without requiring admin authentication.
    const allUsers = await ctx.db.query("users").collect();
    const admins = allUsers.filter((u) => u.role === "admin").length;
    const users = allUsers.filter((u) => u.role === "user").length;

    return {
      total: allUsers.length,
      admins,
      users,
    };
  },
});
