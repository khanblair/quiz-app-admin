# Quiz App - Convex Integration

This document explains how the Quiz App uses Convex for database management with separate admin and mobile functions.

## Project Structure

```
convex/
├── schema.ts              # Database schema definition
├── seed.ts               # Seed script to migrate JSON data
├── web/                  # Admin functions (CRUD operations)
│   └── quizzes.ts       # Admin quiz management
└── mobile/              # Mobile app functions (read-only)
    └── quizzes.ts       # Mobile quiz queries
```

## Setup

### 1. Install Convex (if not already installed)

```bash
npm install convex
```

### 2. Initialize Convex (if needed)

```bash
npx convex dev
```

This will:
- Create a Convex project
- Generate the `EXPO_PUBLIC_CONVEX_URL` in your `.env.local`
- Start the development server

### 3. Seed the Database

To migrate data from `assets/data/quizzes.json` to Convex:

1. Open the Convex dashboard: https://dashboard.convex.dev
2. Navigate to your project
3. Go to "Functions" tab
4. Run the `seed:seedQuizzes` mutation

Alternatively, you can use the Convex CLI:

```bash
npx convex run seed:seedQuizzes
```

To clear all quizzes (use with caution):

```bash
npx convex run seed:clearAllQuizzes
```

## Admin Functions (convex/web/quizzes.ts)

Admin functions provide full CRUD operations for managing quizzes. These should be used in your admin dashboard/panel.

### Available Admin Functions

#### Queries (Read Operations)

- **`getAllQuizzes()`**: Get all quizzes with full details
- **`getQuizById({ id: string })`**: Get a specific quiz by its ID
- **`getQuizzesByCategory({ category: string })`**: Get all quizzes in a category
- **`getAllCategories()`**: Get list of all quiz categories
- **`getQuizStats()`**: Get statistics about quizzes (count by category, difficulty, etc.)

#### Mutations (Write Operations)

- **`createQuiz({ ...quizData })`**: Create a new quiz
- **`updateQuiz({ _id, ...updates })`**: Update an existing quiz
- **`deleteQuiz({ _id })`**: Delete a quiz
- **`bulkCreateQuizzes({ quizzes: [...] })`**: Create multiple quizzes at once

### Example: Admin Usage (Web Dashboard)

```typescript
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function AdminDashboard() {
  // Get all quizzes
  const quizzes = useQuery(api.web.quizzes.getAllQuizzes);
  
  // Get statistics
  const stats = useQuery(api.web.quizzes.getQuizStats);
  
  // Create quiz mutation
  const createQuiz = useMutation(api.web.quizzes.createQuiz);
  
  // Update quiz mutation
  const updateQuiz = useMutation(api.web.quizzes.updateQuiz);
  
  // Delete quiz mutation
  const deleteQuiz = useMutation(api.web.quizzes.deleteQuiz);
  
  const handleCreateQuiz = async (quizData) => {
    await createQuiz({
      id: "new-quiz-id",
      title: "New Quiz",
      description: "Quiz description",
      category: "Frontend",
      difficulty: "Beginner",
      duration: 10,
      questions: [
        {
          id: "q1",
          question: "Sample question?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctAnswer: 0,
          explanation: "Explanation here"
        }
      ]
    });
  };
  
  const handleUpdateQuiz = async (_id, updates) => {
    await updateQuiz({ _id, ...updates });
  };
  
  const handleDeleteQuiz = async (_id) => {
    await deleteQuiz({ _id });
  };
  
  return (
    <div>
      <h1>Quiz Admin Dashboard</h1>
      <p>Total Quizzes: {stats?.totalQuizzes}</p>
      {/* Your admin UI here */}
    </div>
  );
}
```

## Mobile Functions (convex/mobile/quizzes.ts)

Mobile functions provide read-only access to quiz data. These are used in the React Native mobile app.

### Available Mobile Functions

All are queries (read-only):

- **`getAllQuizzes()`**: Get all available quizzes
- **`getQuizById({ id: string })`**: Get a specific quiz
- **`getQuizzesByCategory({ category: string })`**: Filter by category
- **`getQuizzesByDifficulty({ difficulty: string })`**: Filter by difficulty
- **`getAllCategories()`**: Get all categories
- **`searchQuizzes({ searchTerm: string })`**: Search quizzes by title/description
- **`getQuizCountByCategory()`**: Get count of quizzes per category

### Example: Mobile App Usage

The mobile app uses custom hooks in `hooks/use-quizzes.ts`:

```typescript
import { useAllQuizzes, useQuizById, useAllCategories } from '@/hooks/use-quizzes';

function QuizzesScreen() {
  const quizzes = useAllQuizzes();
  const categories = useAllCategories();
  
  if (!quizzes) return <Loading />;
  
  return (
    <View>
      {quizzes.map(quiz => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </View>
  );
}

function QuizScreen({ id }) {
  const quiz = useQuizById(id);
  
  if (quiz === undefined) return <Loading />;
  if (quiz === null) return <NotFound />;
  
  return <QuizDetails quiz={quiz} />;
}
```

## Database Schema

The quiz schema is defined in `convex/schema.ts`:

```typescript
{
  quizzes: {
    id: string,              // Unique quiz identifier
    title: string,           // Quiz title
    description: string,     // Quiz description
    category: string,        // Category (Frontend, Backend, etc.)
    difficulty: string,      // Difficulty level (Beginner, Intermediate, Hard)
    duration: number,        // Estimated duration in minutes
    questions: [{
      id: string,           // Question identifier
      question: string,     // Question text
      options: string[],    // Array of answer options
      correctAnswer: number, // Index of correct answer
      explanation: string   // Explanation of correct answer
    }],
    createdAt?: number,     // Timestamp
    updatedAt?: number      // Timestamp
  }
}
```

## Security Considerations

### Current Setup
- Admin functions (web/quizzes.ts) currently have no authentication
- Mobile functions (mobile/quizzes.ts) are read-only

### Recommended: Add Authentication

For production, you should add authentication to admin functions:

```typescript
// convex/web/quizzes.ts
import { mutation } from "../_generated/server";

export const createQuiz = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // Add authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }
    
    // Proceed with operation
    return await ctx.db.insert("quizzes", { ...args });
  },
});
```

## Migration from JSON

The app previously used a static JSON file at `assets/data/quizzes.json`. The migration involved:

1. ✅ Created Convex schema
2. ✅ Created admin functions (web)
3. ✅ Created mobile functions (mobile)
4. ✅ Added ConvexProvider to app layout
5. ✅ Created custom hooks for mobile app
6. ✅ Updated all screens to use Convex
7. ✅ Created seed script to migrate data

### Old Code (Static JSON)
```typescript
import quizzesData from '@/assets/data/quizzes.json';
const quizzes = quizzesData;
```

### New Code (Convex)
```typescript
import { useAllQuizzes } from '@/hooks/use-quizzes';
const quizzes = useAllQuizzes(); // Returns undefined while loading, then Quiz[]
```

## Development Workflow

### For Mobile App Development

1. Start Convex dev server:
   ```bash
   npx convex dev
   ```

2. Start Expo:
   ```bash
   npm start
   ```

3. The app will automatically sync with Convex changes

### For Admin Dashboard Development

1. Use the same Convex dev server
2. Import admin functions from `api.web.quizzes`
3. Build your admin UI with full CRUD capabilities

## Useful Commands

```bash
# Start Convex dev server
npx convex dev

# Run a mutation
npx convex run seed:seedQuizzes

# Clear database
npx convex run seed:clearAllQuizzes

# Deploy Convex to production
npx convex deploy

# View Convex logs
npx convex logs
```

## Environment Variables

Make sure your `.env.local` includes:

```env
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

## Next Steps

1. **Add Authentication**: Implement Clerk or similar auth for admin functions
2. **Create Admin Dashboard**: Build a web dashboard using Next.js with admin functions
3. **Add User Roles**: Create a users table and implement role-based access control
4. **Analytics**: Track quiz attempts, scores, and user progress
5. **Real-time Updates**: Leverage Convex's real-time capabilities for live leaderboards

## Troubleshooting

### "Convex URL not found"
- Check that `.env.local` has `EXPO_PUBLIC_CONVEX_URL`
- Restart your Expo dev server after adding the variable

### "No quizzes found"
- Run the seed script: `npx convex run seed:seedQuizzes`
- Check Convex dashboard to see if data exists

### "Function not found"
- Make sure Convex dev server is running
- Check that the function path is correct (e.g., `api.mobile.quizzes.getAllQuizzes`)

## Support

For Convex documentation: https://docs.convex.dev
For issues specific to this app: Check the main README.md
