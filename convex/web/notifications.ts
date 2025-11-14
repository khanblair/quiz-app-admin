import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Get all notifications for a user
export const getUserNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get unread notifications count
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    return notifications.length;
  },
});

// Create a notification
export const createNotification = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    quizId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { _id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, { read: true });
    return { success: true };
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { read: true });
    }

    return { success: true, count: notifications.length };
  },
});

// Delete a notification
export const deleteNotification = mutation({
  args: { _id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args._id);
    return { success: true };
  },
});

// Broadcast notification to all users (admin feature)
export const broadcastNotification = mutation({
  args: {
    userIds: v.array(v.string()),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    quizId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userIds, ...notificationData } = args;
    const results = [];

    for (const userId of userIds) {
      const _id = await ctx.db.insert("notifications", {
        userId,
        ...notificationData,
        read: false,
        createdAt: Date.now(),
      });
      results.push(_id);
    }

    return { success: true, count: results.length };
  },
});
