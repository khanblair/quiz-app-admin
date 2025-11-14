# Quiz Admin Dashboard - Setup Instructions

## 📦 Required Packages Installation

Before running the application, install these required packages:

```bash
npm install @clerk/nextjs@latest convex@latest next-themes@latest svix@latest
```

### Package Details:

1. **@clerk/nextjs** - Authentication with email and Google OAuth
2. **convex** - Real-time database and backend
3. **next-themes** - Theme switching (dark/light/system)
4. **svix** - Clerk webhook verification

## 🚀 Quick Start

1. **Install all dependencies**:
   ```bash
   npm install
   ```

2. **Install required packages**:
   ```bash
   npm install @clerk/nextjs convex next-themes svix
   ```

3. **Start Convex development server**:
   ```bash
   npx convex dev
   ```
   - This will initialize Convex and push your schema
   - Keep this terminal running

4. **Start Next.js development server** (in a new terminal):
   ```bash
   npm run dev
   ```

5. **Configure Authentication** (IMPORTANT):
   - See **`AUTH_SETUP.md`** for complete authentication setup
   - Set up Clerk webhook for user sync
   - Get webhook secret and add to .env.local

6. **Open your browser**:
   - Navigate to http://localhost:3000
   - You'll see the welcome page
   - Click "Sign In" or "Create Account"
   - First user becomes admin automatically!

## 🔧 Configuration

### Your .env.local is already configured with:
- ✅ Clerk authentication keys
- ✅ Convex deployment URL
- ✅ All necessary environment variables

### Clerk Setup (Already Done):
Your Clerk account is configured at: https://wondrous-mite-39.clerk.accounts.dev

### Convex Setup (Already Done):
Your Convex deployment: dev:mellow-seahorse-30

## 🎯 What's Been Built

### ✅ Authentication System
- Welcome page with beautiful gradient design
- Sign-in page with Clerk integration
- Sign-up page with Clerk integration
- Email + Google OAuth support
- Protected dashboard routes

### ✅ Dashboard Layout
- Responsive sidebar navigation
- Mobile hamburger menu
- Theme toggle (dark/light/system)
- Notification bell with dropdown
- User profile section

### ✅ Dashboard Pages

**1. Dashboard Home** (`/dashboard`)
- Total quizzes count
- Categories count
- Difficulty breakdown (Easy/Hard)
- Category distribution chart
- Recent quizzes list with quick actions

**2. Quizzes Management** (`/dashboard/quizzes`)
- Grid view of all quizzes
- Real-time search functionality
- Filter by category
- Filter by difficulty
- Create new quiz button
- Edit/Delete actions per quiz
- Confirmation dialog for deletions

**3. Create Quiz** (`/dashboard/quizzes/new`)
- Title and description fields
- Category, difficulty, duration inputs
- Multiple questions with:
  - Question text
  - 4 options per question
  - Correct answer selection (radio)
  - Explanation field
- Add/Remove questions dynamically
- Form validation
- Auto-notification on creation

**4. Edit Quiz** (`/dashboard/quizzes/[id]`)
- Pre-filled form with existing data
- Same features as create
- Update functionality
- Auto-notification on update

**5. Settings** (`/dashboard/settings`)
- User profile display
- Theme selection (Light/Dark/System)
- Browser notification toggle
- Enable push notifications
- App information

### ✅ Convex Backend

**Schema** (`convex/schema.ts`):
- `quizzes` table with full quiz structure
- `notifications` table with user notifications
- Proper indexes for efficient queries

**Quiz Functions** (`convex/web/quizzes.ts`):
- `getAllQuizzes` - Fetch all quizzes
- `getQuizById` - Get single quiz
- `getQuizzesByCategory` - Filter by category
- `createQuiz` - Create new quiz
- `updateQuiz` - Update existing quiz
- `deleteQuiz` - Delete quiz
- `getAllCategories` - Get unique categories
- `getQuizStats` - Dashboard statistics
- `bulkCreateQuizzes` - Seed data

**Notification Functions** (`convex/web/notifications.ts`):
- `getUserNotifications` - Get user's notifications
- `getUnreadCount` - Count unread notifications
- `createNotification` - Create new notification
- `markAsRead` - Mark single as read
- `markAllAsRead` - Mark all as read
- `deleteNotification` - Delete notification
- `broadcastNotification` - Send to multiple users

### ✅ UI Components

**Reusable Components** (`components/ui/`):
- `Button` - Multiple variants (primary, secondary, danger, ghost)
- `Card` - Card container with Header, Title, Content
- `Badge` - Status badges (success, warning, danger, info)

**Feature Components**:
- `ThemeToggle` - Dark/Light mode switcher
- `NotificationBell` - Real-time notification center with:
  - Unread count badge
  - Dropdown with notifications
  - Mark as read functionality
  - Different icons per notification type
  - Time formatting (e.g., "5m ago")

### ✅ PWA Features
- `manifest.json` - App metadata and icons
- `sw.js` - Service worker for offline support
- `lib/pwa.ts` - PWA utility functions
- App shortcuts for quick navigation
- Installable on desktop and mobile
- Push notification support

### ✅ Styling & Animations
- Modern gradient designs (indigo to purple)
- Smooth page transitions
- Fade-in animations
- Slide-down dropdowns
- Hover effects
- Custom scrollbar
- Glass morphism effects
- Fully responsive (mobile, tablet, desktop)

### ✅ Theme System
- Light mode (default)
- Dark mode
- System mode (auto-detect)
- Persistent theme preference
- Smooth transitions between themes

## 📱 Features Highlights

### Notification System
When you create, update, or delete a quiz:
1. A notification is automatically created
2. The notification bell shows unread count
3. Clicking the bell shows all notifications
4. Click a notification to mark it as read
5. Browser push notifications work even when app is closed

### Quiz CRUD Operations
**Create**:
1. Click "Create Quiz" button
2. Fill in title, description, category, difficulty, duration
3. Add questions (minimum 1, unlimited maximum)
4. Each question has 4 options
5. Select correct answer via radio button
6. Add explanation (optional)
7. Click "Create Quiz"
8. Redirected to quiz list
9. Notification sent

**Read**:
1. View all quizzes on `/dashboard/quizzes`
2. Use search bar to filter by title/description
3. Use category dropdown to filter
4. Use difficulty dropdown to filter
5. See quiz cards with stats

**Update**:
1. Click "Edit" on any quiz card
2. Modify any fields
3. Add/remove questions
4. Click "Save Changes"
5. Notification sent

**Delete**:
1. Click trash icon on quiz card
2. Confirmation appears
3. Click "Confirm Delete"
4. Quiz removed from database
5. Notification sent

### Theme Switching
1. Click moon/sun icon in header
2. Or go to Settings page
3. Choose Light, Dark, or System
4. Theme persists across sessions

### PWA Installation
**Desktop**:
- Look for install icon in address bar
- Or use browser menu > Install

**Mobile**:
- iOS: Share button > Add to Home Screen
- Android: Menu > Install App

## 🎨 Design System

### Colors:
- **Primary**: Indigo (#6366f1)
- **Secondary**: Purple (#a855f7)
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red
- **Neutral**: Gray shades

### Typography:
- Font: Inter (Google Fonts)
- Responsive sizes
- Clear hierarchy

### Spacing:
- Consistent padding and margins
- Responsive grid layouts
- Mobile-friendly touch targets

## 📝 Next Steps

1. **Install packages** (see above)
2. **Run Convex**: `npx convex dev`
3. **Run Next.js**: `npm run dev`
4. **Create PWA icons** (see `public/ICONS_README.md`)
5. **Test features**:
   - Sign up/Sign in
   - Create a quiz
   - Check notifications
   - Try theme switching
   - Test on mobile

## 🐛 Troubleshooting

### If Convex fails to start:
```bash
npx convex dev --once
```

### If authentication doesn't work:
- Check `.env.local` has correct Clerk keys
- Verify Clerk dashboard settings

### If notifications don't work:
- Check browser notification permissions
- Enable in Settings page
- Check browser console for errors

### If PWA doesn't install:
- Add icon files (see ICONS_README.md)
- Check manifest.json is accessible
- Use HTTPS or localhost

## 📚 Documentation

- Full README: `README.md`
- PWA Icons: `public/ICONS_README.md`
- This file: `SETUP_INSTRUCTIONS.md`

## ✨ You're All Set!

Your quiz admin dashboard is fully built and ready to use. Install the packages and start the servers to see it in action!
