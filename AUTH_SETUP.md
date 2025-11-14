# Authentication & User Role Setup

## 🔐 Authentication Flow

The app now has a complete authentication system with user roles (admin/user):

1. User signs up or signs in with Clerk
2. Redirected to `/auth-callback` 
3. User data synced to Convex database
4. Role assigned (first user = admin, others = user)
5. Redirected to `/dashboard`
6. Dashboard protected by AdminGuard

## 📋 Required Setup Steps

### 1. Install Additional Package

```bash
npm install svix
```

This is needed for Clerk webhook verification.

### 2. Update Environment Variables

Add to your `.env.local`:

```env
# Existing variables (already set)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d29uZHJvdXMtbWl0ZS0zOS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_YcE4ApNcWTv0cn1JJ8C0qi9enyks2vYtzCbaz03nL6
CLERK_JWT_ISSUER=https://wondrous-mite-39.clerk.accounts.dev
CONVEX_DEPLOYMENT=dev:mellow-seahorse-30
NEXT_PUBLIC_CONVEX_URL=https://mellow-seahorse-30.convex.cloud

# NEW - Add this webhook secret (will be generated in next step)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Configure Clerk Webhook

#### Step 3.1: Get Your Webhook URL

When running locally:
```
http://localhost:3000/api/webhooks/clerk
```

For production, replace with your actual domain.

#### Step 3.2: Create Webhook in Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application: "wondrous-mite-39"
3. Navigate to **Webhooks** in the sidebar
4. Click **+ Add Endpoint**
5. Enter your endpoint URL: `http://localhost:3000/api/webhooks/clerk`
6. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
7. Click **Create**
8. Copy the **Signing Secret** (starts with `whsec_`)
9. Add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

#### Step 3.3: For Local Development (Optional)

If testing webhooks locally, use ngrok or similar:

```bash
ngrok http 3000
```

Then use the ngrok URL in Clerk webhook settings.

### 4. Push Updated Schema to Convex

```bash
npx convex dev
```

This will update your database schema with the new `users` table.

## 🎯 How User Roles Work

### First User = Admin
- The **first user** to sign up automatically gets the `admin` role
- This user has full access to the dashboard
- Can manage all quizzes

### Subsequent Users = Regular Users
- All other users get the `user` role
- Cannot access the admin dashboard
- Redirected to `/unauthorized` page

### Checking Roles in Code

```typescript
// In a component
import { useUserRole } from "@/lib/hooks/use-user-role";

function MyComponent() {
  const { isAdmin, isUser, role, user } = useUserRole();
  
  if (isAdmin) {
    // Show admin features
  }
}
```

### Convex Queries

```typescript
// Get current user
const user = await ctx.db.query(api.users.getCurrentUser);

// Check if admin
const isAdmin = await ctx.db.query(api.users.isAdmin);

// Get all users (admin only)
const users = await ctx.db.query(api.users.getAllUsers);
```

## 📁 Files Created

### Core Authentication:
- ✅ `convex/users.ts` - User management functions
- ✅ `convex/auth.config.ts` - Convex auth configuration
- ✅ `app/auth-callback/page.tsx` - Post-authentication callback
- ✅ `app/api/webhooks/clerk/route.ts` - Clerk webhook handler

### Protection & Guards:
- ✅ `components/admin-guard.tsx` - Protect admin routes
- ✅ `lib/hooks/use-user-role.ts` - Hook to check user role
- ✅ `app/unauthorized/page.tsx` - Access denied page

### Updated Files:
- ✅ `convex/schema.ts` - Added users table
- ✅ `middleware.ts` - Allow auth-callback route
- ✅ `app/sign-in/[[...sign-in]]/page.tsx` - Redirect to callback
- ✅ `app/sign-up/[[...sign-up]]/page.tsx` - Redirect to callback
- ✅ `app/dashboard/layout.tsx` - Wrapped with AdminGuard

## 🚀 User Functions (convex/users.ts)

### Available Functions:

#### Queries (Read):
- `getCurrentUser()` - Get currently authenticated user
- `isAdmin()` - Check if current user is admin
- `getUserByClerkId(clerkId)` - Get user by Clerk ID
- `getAllUsers()` - Get all users (admin only)
- `getUsersByRole(role)` - Get users by role
- `getUserStats()` - Get user statistics (admin only)

#### Mutations (Write):
- `upsertUser(...)` - Create or update user (webhook)
- `syncUser()` - Sync current user to database
- `updateUserRole(userId, role)` - Change user role (admin only)

## 🔄 Authentication Flow Diagram

```
┌─────────────┐
│  Welcome    │
│   Page      │
└──────┬──────┘
       │
       ├──Sign Up/Sign In
       │
┌──────▼──────┐
│   Clerk     │
│   Auth      │
└──────┬──────┘
       │
       │ (parallel)
       ├──Webhook─────────┐
       │                  │
       │              ┌───▼────┐
       │              │ Convex │
       │              │ upsert │
       │              └────────┘
       │
┌──────▼──────────┐
│ /auth-callback  │
│  - Sync user    │
│  - Get/assign   │
│    role         │
└──────┬──────────┘
       │
       ├──Is Admin?
       │
       ├──Yes──►┌──────────┐
       │        │Dashboard │
       │        └──────────┘
       │
       └──No───►┌──────────┐
                │Unauthorized│
                └──────────┘
```

## 🧪 Testing the Setup

### Test 1: First User (Admin)
1. Clear your Convex database (optional, for fresh test)
2. Sign up with a new account
3. Should redirect to dashboard
4. Check you can access all features

### Test 2: Second User (Regular User)
1. Sign up with another account
2. Should redirect to dashboard
3. Get blocked by AdminGuard
4. See "Access Denied" page

### Test 3: Webhook Sync
1. Update your name in Clerk dashboard
2. Check Convex database updates
3. Verify user data syncs correctly

## 🐛 Troubleshooting

### "Not authenticated" error
- Make sure you're signed in
- Check Clerk environment variables
- Verify JWT issuer matches

### Webhook not working
- Check `CLERK_WEBHOOK_SECRET` is set
- Verify webhook URL is correct
- Check webhook logs in Clerk dashboard
- For localhost, use ngrok or similar

### User not syncing
- Check webhook events are enabled
- Verify webhook secret is correct
- Check browser console for errors
- Check Convex logs: `npx convex logs`

### AdminGuard infinite loading
- Make sure Convex is running
- Check auth.config.ts is correct
- Verify user exists in database

## 🔒 Security Notes

1. **First User = Admin**: Make sure YOU sign up first!
2. **Webhook Secret**: Keep it secret, never commit to git
3. **Role Changes**: Only admins can change roles
4. **JWT Validation**: Convex validates Clerk JWTs automatically

## 📚 Admin vs User Folder Structure

```
convex/
├── web/              # Admin-only functions
│   ├── quizzes.ts    # Quiz CRUD (admin)
│   └── notifications.ts # Notifications (admin)
│
├── mobile/           # User functions (future)
│   └── [user functions will go here]
│
└── users.ts          # Shared user management
```

## ✅ Next Steps

1. Install `svix`: `npm install svix`
2. Add `CLERK_WEBHOOK_SECRET` to `.env.local`
3. Set up webhook in Clerk dashboard
4. Run `npx convex dev`
5. Test sign up flow
6. Verify first user gets admin role

## 🎉 You're All Set!

Your authentication is now fully configured with role-based access control!
