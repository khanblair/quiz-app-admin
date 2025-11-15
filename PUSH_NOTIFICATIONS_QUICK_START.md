# Push Notifications - Quick Start

## 🚀 Ready to Test!

Your push notifications are **fully configured** and ready to test!

## What Was Configured

✅ **expo-notifications** (v0.32.12) - Already installed
✅ **expo-device** (v8.0.9) - Already installed
✅ **app.json** - Notification settings configured
✅ **Convex Schema** - Push token storage added
✅ **Push Notification Hook** - Auto-registers on app start
✅ **Convex Actions** - Send notifications from backend
✅ **Foreground Handler** - Shows notifications when app is open
✅ **Background Handler** - Receives notifications when app is closed
✅ **Token Management** - Automatically stores tokens in database

## 📝 Important Note: Notification Icon

The configuration references `./assets/images/notification-icon.png` which doesn't exist yet. You have two options:

### Option 1: Use Existing Icon (Quick)
Update `app.json` to use your existing app icon:

```json
"notification": {
  "icon": "./assets/images/icon.png",  // ← Use your existing icon
  "color": "#1A8917",
  "androidMode": "default",
  "androidCollapsedTitle": "New notification from QuizApp"
},
```

### Option 2: Create Dedicated Notification Icon (Recommended)
Create a notification icon specifically for Android:
- **Size**: 96x96px PNG
- **Style**: White icon on transparent background
- **Path**: `./assets/images/notification-icon.png`
- **Tool**: Use https://romannurik.github.io/AndroidAssetStudio/icons-notification.html

## ⚡ Quick Test (5 Minutes)

### Step 1: Run on Physical Device

```bash
npm start
```

Then scan QR code with your phone (must be physical device, not simulator).

### Step 2: Grant Permissions

When the app asks for notification permissions, tap **Allow**.

### Step 3: Check Console

You should see:
```
Push token registered: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

### Step 4: Send Test Notification

Go to https://expo.dev/notifications and:
1. Enter your Expo Push Token (from console)
2. Enter title: "Test Notification"
3. Enter message: "Push notifications working!"
4. Click "Send a Notification"

### Step 5: Verify

**Foreground Test:**
- Keep app open
- Send notification
- Should see banner at top of screen ✅

**Background Test:**
- Minimize app
- Send notification
- Should see notification in system tray ✅
- Tap it → app opens ✅

**Killed Test:**
- Force close app
- Send notification
- Should see notification in system tray ✅
- Tap it → app launches ✅

## 🎯 Next Steps

1. **Update notification icon** (see note above)
2. **Test on your device** (follow quick test)
3. **Integrate into your features**:
   - Send notification when quiz is completed
   - Send daily reminders
   - Send achievement notifications

## 💡 Example: Send Notification When Quiz Completes

```typescript
// In your quiz completion handler
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';

const notifyQuizCompleted = useAction(api.pushNotifications.notifyQuizCompleted);
const { userId } = useAuth();

const handleQuizFinish = async (score: number, totalQuestions: number) => {
  // ... save results ...
  
  // Send push notification
  await notifyQuizCompleted({
    userId: userId!,
    quizTitle: "React Native Basics",
    score,
    totalQuestions,
  });
};
```

## 📚 Full Documentation

See `PUSH_NOTIFICATIONS_SETUP.md` for:
- Complete API reference
- All notification functions
- Advanced examples
- Troubleshooting guide
- Production checklist

## ⚠️ Important Reminders

1. **Physical Device Only** - Push notifications don't work on simulators/emulators
2. **Internet Required** - Token registration needs network connection
3. **Permissions Required** - Must grant notification permissions
4. **Logged In** - Push tokens are linked to authenticated users

## 🐛 Troubleshooting

**No push token?**
- Check if running on physical device (not simulator)
- Verify internet connection
- Check console for errors

**Notifications not received?**
- Verify permissions are granted
- Check notification settings on device
- Use https://expo.dev/notifications to test

**Token not in database?**
- Ensure user is logged in via Clerk
- Check Convex database (users table, pushToken field)
- Look for errors in console

## ✨ That's It!

Your push notifications are ready to go. Test them out and start engaging your users!

For detailed documentation, see **PUSH_NOTIFICATIONS_SETUP.md**.
