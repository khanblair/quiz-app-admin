import { v } from "convex/values";
import { action } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const collectPushableUserIds = async (ctx: ActionCtx, role: string = "user"): Promise<string[]> => {
  const users = await ctx.runQuery((api as any).users.getPushableUsersByRole, {
    role,
  });

  return users.map((user: any) => user.clerkId);
};

// Send push notification to a single user
export const sendPushNotification = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; data?: any; error?: string }> => {
    // Get user's push token from database
    const user = await ctx.runQuery((api as any).users.getUserByClerkId, {
      clerkId: args.userId,
    });

    if (!user || !user.pushToken) {
      console.log(`No push token found for user ${args.userId}`);
      return { success: false, error: "No push token found" };
    }

    // Send push notification via Expo Push API
    const message = {
      to: user.pushToken,
      sound: 'default',
      title: args.title,
      body: args.body,
      data: args.data || {},
      channelId: args.channelId || 'default',
      priority: 'high',
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();
      console.log('Push notification sent:', data);

      // Also create a notification in the database
      await ctx.runMutation((api as any)["mobile/notifications"].createNotification, {
        userId: args.userId,
        title: args.title,
        message: args.body,
        type: args.data?.type || 'system',
        quizId: args.data?.quizId,
      });

      return { success: true, data };
    } catch (error: unknown) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Send push notification to multiple users (broadcast)
export const sendBroadcastPushNotification = action({
  args: {
    userIds: v.array(v.string()),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; results: any[] }> => {
    const results: any[] = [];

    for (const userId of args.userIds) {
      const result = await ctx.runAction((api as any).pushNotifications.sendPushNotification, {
        userId,
        title: args.title,
        body: args.body,
        data: args.data,
        channelId: args.channelId,
      });
      results.push({ userId, ...result });
    }

    return { success: true, results };
  },
});

// Send notification when quiz is completed
export const notifyQuizCompleted = action({
  args: {
    userId: v.string(),
    quizTitle: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; data?: any; error?: string }> => {
    const percentage = Math.round((args.score / args.totalQuestions) * 100);
    const isPerfect = args.score === args.totalQuestions;

    const title = isPerfect ? '🎉 Perfect Score!' : '✅ Quiz Completed!';
    const body = isPerfect
      ? `Congratulations! You scored ${args.score}/${args.totalQuestions} on "${args.quizTitle}"`
      : `You scored ${args.score}/${args.totalQuestions} (${percentage}%) on "${args.quizTitle}"`;

    return await ctx.runAction(api.pushNotifications.sendPushNotification, {
      userId: args.userId,
      title,
      body,
      data: {
        type: 'quiz',
        screen: '/quiz/results',
        score: args.score,
        totalQuestions: args.totalQuestions,
      },
      channelId: 'quiz',
    });
  },
});

// Send achievement notification
export const notifyAchievement = action({
  args: {
    userId: v.string(),
    achievementTitle: v.string(),
    achievementDescription: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; data?: any; error?: string }> => {
    return await ctx.runAction((api as any).pushNotifications.sendPushNotification, {
      userId: args.userId,
      title: `🏆 ${args.achievementTitle}`,
      body: args.achievementDescription,
      data: {
        type: 'achievement',
        screen: '/profile',
      },
      channelId: 'achievement',
    });
  },
});

// Send quiz activity notifications to all push-enabled users
export const notifyQuizActivity = action({
  args: {
    quizId: v.string(),
    title: v.string(),
    body: v.string(),
    screen: v.optional(v.string()),
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; results?: any[]; error?: string }> => {
    const userIds = await collectPushableUserIds(ctx, "user");
    if (userIds.length === 0) {
      console.log("No pushable users found for quiz activity notification");
      return { success: false, error: "No push tokens registered" };
    }

    return await ctx.runAction((api as any).pushNotifications.sendBroadcastPushNotification, {
      userIds,
      title: args.title,
      body: args.body,
      data: {
        type: 'quiz',
        screen: args.screen || '/quizzes',
        quizId: args.quizId,
      },
      channelId: args.channelId || 'quiz',
    });
  },
});

// Test push notification function
export const sendTestNotification = action({
  args: {
    pushToken: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; data?: any; error?: string }> => {
    const message = {
      to: args.pushToken,
      sound: 'default',
      title: '🧪 Test Notification',
      body: 'This is a test push notification from QuizApp!',
      data: { test: true },
      priority: 'high',
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();
      console.log('Test push notification sent:', data);
      return { success: true, data };
    } catch (error: unknown) {
      console.error('Error sending test push notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
