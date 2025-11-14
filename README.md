# Quiz Admin Dashboard

A modern, full-featured quiz management platform built with Next.js, Convex, and Clerk authentication.

## Features

### 🔐 Authentication
- Email and Google OAuth authentication via Clerk
- Protected routes with middleware
- User profile management

### 📊 Dashboard
- Real-time statistics and analytics
- Category and difficulty breakdowns
- Recent quiz overview with charts
- Responsive design for all devices

### 📝 Quiz Management (Full CRUD)
- **Create**: Build quizzes with multiple questions and options
- **Read**: View all quizzes with search and filter capabilities
- **Update**: Edit existing quizzes with real-time updates
- **Delete**: Remove quizzes with confirmation dialog

### 🔔 Notifications
- Real-time notifications for quiz activities
- Browser push notifications (foreground & background)
- Notification center with read/unread status
- Automatic notifications when:
  - New quiz is created
  - Quiz is updated
  - Quiz is deleted

### 🎨 Theme & UI
- Dark/Light/System theme switching
- Modern gradient designs
- Smooth animations and transitions
- Responsive layout (mobile, tablet, desktop)
- Custom scrollbar styling
- Glass morphism effects

### 📱 PWA Support
- Installable as a Progressive Web App
- Offline functionality with service worker
- App shortcuts for quick access
- Custom app icons

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Convex (Real-time backend)
- **Authentication**: Clerk (Email + Google OAuth)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Notifications**: Web Push API
- **PWA**: Service Worker + Web App Manifest

## Required Packages

Before running the app, install the following packages:

```bash
npm install @clerk/nextjs convex next-themes svix
```

Or all at once:

```bash
npm install @clerk/nextjs@latest convex@latest next-themes@latest svix@latest
```

## Environment Variables

Your `.env.local` file should contain:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER=your_clerk_jwt_issuer
CLERK_WEBHOOK_SECRET=your_webhook_secret  # Get from Clerk dashboard

# Convex Database
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

**Important**: See `AUTH_SETUP.md` for complete authentication setup instructions!

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install required packages**:
   ```bash
   npm install @clerk/nextjs convex next-themes
   ```

3. **Set up Convex**:
   ```bash
   npx convex dev
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
quiz-app-admin/
├── app/
│   ├── dashboard/           # Dashboard pages
│   │   ├── page.tsx         # Dashboard home
│   │   ├── quizzes/         # Quiz management
│   │   │   ├── page.tsx     # Quiz list
│   │   │   ├── new/         # Create quiz
│   │   │   └── [id]/        # Edit quiz
│   │   ├── settings/        # Settings page
│   │   └── layout.tsx       # Dashboard layout
│   ├── sign-in/             # Sign in page
│   ├── sign-up/             # Sign up page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Welcome page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── theme-toggle.tsx     # Theme switcher
│   └── notification-bell.tsx # Notification center
├── convex/
│   ├── web/                 # Admin functions
│   │   ├── quizzes.ts       # Quiz CRUD operations
│   │   └── notifications.ts # Notification functions
│   └── schema.ts            # Database schema
├── lib/
│   ├── providers.tsx        # App providers
│   └── pwa.ts               # PWA utilities
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker
│   └── icon.svg             # App icon
└── middleware.ts            # Clerk middleware

```

## Features Detail

### Quiz Management
- **Search**: Real-time search across quiz titles and descriptions
- **Filters**: Filter by category and difficulty level
- **Validation**: Form validation for all required fields
- **Rich Forms**: Multiple questions with 4 options each
- **Explanations**: Add explanations for correct answers

### Notification System
- **Admin Notifications**: Get notified of all quiz changes
- **Broadcast**: Send notifications to multiple users
- **Persistence**: All notifications stored in database
- **Real-time Updates**: Instant notification delivery via Convex
- **Browser Push**: Push notifications even when app is closed

### Responsive Design
- Mobile-first approach
- Sidebar collapses to hamburger menu on mobile
- Touch-friendly UI elements
- Optimized for all screen sizes

### Performance
- Server-side rendering with Next.js
- Optimistic UI updates
- Efficient data fetching with Convex queries
- Lazy loading of components
- Image optimization

## PWA Installation

### Desktop (Chrome/Edge):
1. Click the install icon in the address bar
2. Click "Install"

### Mobile (iOS Safari):
1. Open the website
2. Tap the Share button
3. Tap "Add to Home Screen"

### Mobile (Android Chrome):
1. Tap the three-dot menu
2. Tap "Install App"

## Development

### Adding New Features
1. Create Convex functions in `convex/web/`
2. Update schema in `convex/schema.ts`
3. Create UI components in `components/`
4. Add pages in `app/`

### Testing Notifications
1. Go to Settings page
2. Click "Enable" for browser notifications
3. Create or update a quiz
4. Check the notification bell icon

## Build for Production

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
