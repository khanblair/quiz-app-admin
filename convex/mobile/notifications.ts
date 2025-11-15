import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Mobile: Get all notifications for authenticated user
export const getUserNotifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Mobile: Get unread notifications count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return 0;
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", identity.subject).eq("read", false)
      )
      .collect();
    
    return notifications.length;
  },
});

// Mobile: Mark notification as read
export const markAsRead = mutation({
  args: { _id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the notification belongs to the user
    const notification = await ctx.db.get(args._id);
    if (!notification || notification.userId !== identity.subject) {
      throw new Error("Notification not found or unauthorized");
    }

    await ctx.db.patch(args._id, { read: true });
    return { success: true };
  },
});

// Mobile: Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", identity.subject).eq("read", false)
      )
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { read: true });
    }

    return { success: true, count: notifications.length };
  },
});

// Mobile: Delete a notification
export const deleteNotification = mutation({
  args: { _id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the notification belongs to the user
    const notification = await ctx.db.get(args._id);
    if (!notification || notification.userId !== identity.subject) {
      throw new Error("Notification not found or unauthorized");
    }

    await ctx.db.delete(args._id);
    return { success: true };
  },
});

// Mobile: Create a notification (for internal use by push notification system)
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
