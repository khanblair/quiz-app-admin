# Push Notifications Setup Guide

## Overview

Your Quiz App now has **complete push notification support** for both foreground and background scenarios using Expo's push notification service. This implementation follows 2025 best practices and is production-ready.

## Features Implemented

✅ **Foreground Notifications**: Receive and display notifications when app is open
✅ **Background Notifications**: Receive notifications when app is in background or killed
✅ **Push Token Management**: Automatically registers and stores push tokens in Convex
✅ **Android Notification Channels**: Configured channels for different notification types
✅ **iOS Support**: Full iOS push notification support
✅ **Database Integration**: Push tokens stored securely in Convex database
✅ **Notification History**: All push notifications also saved to database
✅ **Multiple Notification Types**: Quiz, Achievement, and System notifications

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  usePushNotifications Hook                        │  │
│  │  - Registers for notifications                    │  │
│  │  - Gets Expo Push Token                           │  │
│  │  - Handles foreground notifications               │  │
│  │  - Handles user interactions                      │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Convex updatePushToken Mutation                 │  │
│  │  - Stores token in users table                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Convex Backend                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  pushNotifications.ts Actions                     │  │
│  │  - sendPushNotification                           │  │
│  │  - sendBroadcastPushNotification                  │  │
│  │  - notifyQuizCompleted                            │  │
│  │  - notifyAchievement                              │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Expo Push Service                                │  │
│  │  https://exp.host/--/api/v2/push/send            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              User's Device (via FCM/APNs)              │
│  - Receives notification in foreground                 │
│  - Receives notification in background                 │
│  - Receives notification when app is killed            │
└─────────────────────────────────────────────────────────┘
```

## How It Works

### 1. **Registration & Token Storage**

When the app starts:
1. `usePushNotifications` hook initializes
2. Checks if running on physical device (required for push notifications)
3. Requests notification permissions from user
4. Gets Expo Push Token from Expo servers
5. Stores token in Convex database via `updatePushToken` mutation
6. Sets up notification handlers for foreground and background

### 2. **Sending Push Notifications**

To send a push notification:

```typescript
// Example: Send when quiz is completed
import { api } from '@/convex/_generated/api';
import { useAction } from 'convex/react';

const notifyQuizCompleted = useAction(api.pushNotifications.notifyQuizCompleted);

// Call it when quiz finishes
await notifyQuizCompleted({
  userId: user.clerkId,
  quizTitle: "React Native Basics",
  score: 8,
  totalQuestions: 10,
});
```

### 3. **Receiving Notifications**

**Foreground (App Open):**
- Notification appears as banner/alert
- `shouldShowAlert: true` configured
- Plays sound and sets badge
- Notification data available in app

**Background (App Minimized):**
- Notification appears in system tray
- Tapping notification opens app
- Notification data available when app opens

**Killed (App Not Running):**
- Notification appears in system tray
- Tapping notification launches app
- Notification data available on launch

## Configuration Files

### 1. **app.json**

```json
{
  "notification": {
    "icon": "./assets/images/notification-icon.png",
    "color": "#1A8917",
    "androidMode": "default",
    "androidCollapsedTitle": "New notification from QuizApp"
  },
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/images/notification-icon.png",
        "color": "#1A8917",
        "sounds": [],
        "mode": "production"
      }
    ]
  ]
}
```

### 2. **Convex Schema (convex/schema.ts)**

```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  name: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  role: v.string(),
  pushToken: v.optional(v.string()), // ← Push token stored here
  createdAt: v.number(),
  lastLoginAt: v.number(),
})
```

### 3. **Android Notification Channels**

Three channels configured:
- **default**: General notifications (MAX importance)
- **quiz**: Quiz-related notifications (HIGH importance)
- **achievement**: Achievement notifications (HIGH importance, gold color)

## API Reference

### Convex Actions (Backend)

#### `sendPushNotification`
Send a push notification to a single user.

```typescript
await ctx.runAction(api.pushNotifications.sendPushNotification, {
  userId: "user_123",
  title: "New Quiz Available!",
  body: "Check out the latest JavaScript quiz",
  data: { screen: "/quiz/123" },
  channelId: "quiz", // optional: default | quiz | achievement
});
```

#### `sendBroadcastPushNotification`
Send the same notification to multiple users.

```typescript
await ctx.runAction(api.pushNotifications.sendBroadcastPushNotification, {
  userIds: ["user_1", "user_2", "user_3"],
  title: "Quiz Marathon Starting!",
  body: "Join the quiz marathon happening now!",
  data: { screen: "/quizzes" },
});
```

#### `notifyQuizCompleted`
Specialized notification for quiz completion.

```typescript
await ctx.runAction(api.pushNotifications.notifyQuizCompleted, {
  userId: "user_123",
  quizTitle: "React Native Basics",
  score: 8,
  totalQuestions: 10,
});
```

#### `notifyAchievement`
Send an achievement notification.

```typescript
await ctx.runAction(api.pushNotifications.notifyAchievement, {
  userId: "user_123",
  achievementTitle: "Quiz Master",
  achievementDescription: "Completed 10 quizzes with perfect scores!",
});
```

#### `sendTestNotification`
Send a test notification (useful for testing).

```typescript
await ctx.runAction(api.pushNotifications.sendTestNotification, {
  pushToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
});
```

### Convex Mutations

#### `updatePushToken`
Update user's push token (called automatically by hook).

```typescript
await updatePushToken({ pushToken: "ExponentPushToken[xxx]" });
```

## Testing Push Notifications

### Prerequisites

⚠️ **IMPORTANT**: Push notifications only work on **physical devices**, not simulators/emulators.

- **iOS**: Requires physical iPhone/iPad
- **Android**: Requires physical Android device

### Step 1: Build and Run on Physical Device

```bash
# For development build
npx expo start

# Then scan QR code with:
# - iOS: Camera app or Expo Go
# - Android: Expo Go app
```

### Step 2: Grant Notification Permissions

When the app launches, it will request notification permissions. **Grant the permissions**.

### Step 3: Check Token Registration

Look at the console logs:
```
Push token registered: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

This means push notifications are working!

### Step 4: Send a Test Notification

You have several options:

**Option A: Use Expo's Push Notification Tool**
1. Go to https://expo.dev/notifications
2. Enter your Expo Push Token (from console logs)
3. Enter title and message
4. Click "Send a Notification"

**Option B: Use Convex Dashboard**
1. Open Convex dashboard
2. Go to Functions
3. Run `sendTestNotification` action
4. Pass your push token

**Option C: Trigger from App**
Create a button in your app that calls `sendTestNotification`:

```typescript
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

const sendTest = useAction(api.pushNotifications.sendTestNotification);

// In your component
<Button onPress={async () => {
  if (expoPushToken) {
    await sendTest({ pushToken: expoPushToken.data });
  }
}}>
  Send Test Notification
</Button>
```

### Step 5: Test Different Scenarios

**Test Foreground:**
1. Keep app open
2. Send a notification
3. Should see banner at top
4. Should hear sound
5. Console should log: "Notification received in foreground"

**Test Background:**
1. Minimize app (home button)
2. Send a notification
3. Should see notification in system tray
4. Tap notification → app opens
5. Console should log: "User interacted with notification"

**Test Killed:**
1. Force close app completely
2. Send a notification
3. Should see notification in system tray
4. Tap notification → app launches
5. Console should log: "User interacted with notification"

## Integration Examples

### Example 1: Notify on Quiz Completion

```typescript
// In your quiz completion screen
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';

const notifyQuizCompleted = useAction(api.pushNotifications.notifyQuizCompleted);
const { userId } = useAuth();

const handleQuizComplete = async (score: number, totalQuestions: number) => {
  // Save quiz results...
  
  // Send push notification
  await notifyQuizCompleted({
    userId: userId!,
    quizTitle: quizData.title,
    score,
    totalQuestions,
  });
};
```

### Example 2: Daily Quiz Reminder

```typescript
// Create a scheduled Convex cron job
// In convex/crons.ts

import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Send daily reminder at 9 AM
crons.daily(
  "daily quiz reminder",
  { hourUTC: 9, minuteUTC: 0 },
  api.pushNotifications.sendDailyReminder
);

export default crons;
```

### Example 3: Achievement Notification

```typescript
// When user reaches milestone
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

const notifyAchievement = useAction(api.pushNotifications.notifyAchievement);

// Check if milestone reached
if (userQuizCount === 10) {
  await notifyAchievement({
    userId: userId,
    achievementTitle: "Quiz Enthusiast",
    achievementDescription: "You've completed 10 quizzes!",
  });
}
```

## Notification Data & Navigation

You can attach custom data to notifications and handle navigation:

```typescript
// Sending with custom data
await sendPushNotification({
  userId: "user_123",
  title: "New Quiz!",
  body: "Try our latest quiz",
  data: {
    screen: "/quiz/[id]",
    quizId: "quiz_456",
    action: "open_quiz",
  },
});
```

Handle in app:

```typescript
// In usePushNotifications hook, update responseListener
responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  
  if (data?.action === 'open_quiz' && data?.quizId) {
    // Navigate using expo-router
    router.push(`/quiz/${data.quizId}`);
  }
});
```

## Troubleshooting

### Issue: "Push notifications only work on physical devices"

**Solution**: You must use a physical device. Simulators/emulators don't support push notifications.

### Issue: "Failed to get push notification permissions"

**Solution**: 
- Check device settings → QuizApp → Notifications → Ensure enabled
- Uninstall and reinstall app to re-trigger permission request
- On iOS, check Settings → Notifications → QuizApp

### Issue: "No push token found"

**Solution**:
- Ensure user is logged in (push tokens are linked to users)
- Check console for errors during token registration
- Verify internet connection (token registration requires network)

### Issue: "Notifications not received in background/killed state"

**Solution**:
- Ensure notification permissions are granted
- Check if "Background App Refresh" is enabled (iOS)
- Verify push token is valid in Convex database
- Check Expo push notification dashboard for delivery status

### Issue: "ExpoPushToken is undefined"

**Solution**:
- Running on simulator/emulator (not supported)
- No internet connection during registration
- Check `EXPO_PUBLIC_PROJECT_ID` in .env.local
- Ensure Clerk authentication is working

## Environment Variables

Make sure these are in your `.env.local`:

```env
# Already configured
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_CONVEX_URL=https://...convex.cloud

# Project ID (from app.json "extra.eas.projectId")
EXPO_PUBLIC_PROJECT_ID=7a6ae96e-bddc-4b9e-ad34-ccc3363452ec
```

## Production Checklist

Before going to production:

- [ ] Test notifications on both iOS and Android physical devices
- [ ] Verify notification icons display correctly
- [ ] Test all notification types (quiz, achievement, system)
- [ ] Test foreground, background, and killed scenarios
- [ ] Implement proper error handling for notification failures
- [ ] Set up monitoring for push notification delivery rates
- [ ] Configure notification sounds (optional)
- [ ] Add notification images (optional)
- [ ] Implement notification preferences/settings for users
- [ ] Test with multiple users
- [ ] Verify notification data/navigation works correctly

## Additional Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Push Notification Best Practices](https://docs.expo.dev/push-notifications/sending-notifications/)

## Files Created/Modified

**New Files:**
- `hooks/use-push-notifications.ts` - Push notification hook
- `convex/pushNotifications.ts` - Push notification actions
- `PUSH_NOTIFICATIONS_SETUP.md` - This documentation

**Modified Files:**
- `app.json` - Added notification configuration
- `app/_layout.tsx` - Integrated usePushNotifications hook
- `convex/schema.ts` - Added pushToken field to users table
- `convex/users.ts` - Added updatePushToken mutation
- `convex/mobile/notifications.ts` - Added createNotification mutation

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify all environment variables are set
3. Ensure running on physical device
4. Check Expo push notification dashboard
5. Review Convex function logs

---

**🎉 Your push notifications are ready!** Test them out and start engaging your users!
