"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    const handleAuth = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const clerkId = user.id;

          if (!clerkId) {
            // Missing Clerk id — skip upsert but continue to dashboard
            router.push("/dashboard");
            return;
          }

          // Normalize email/name/image across Clerk SDK shapes
          const email =
            user.primaryEmailAddress?.emailAddress ||
            user.emailAddresses?.[0]?.emailAddress ||
            // some Clerk SDKs expose `email` directly
            (user as any).email ||
            "";

          const name =
            user.fullName ||
            [ (user as any).firstName, (user as any).lastName ].filter(Boolean).join(" ") ||
            (user as any).username ||
            undefined;

          const imageUrl =
            (user as any).profileImageUrl ||
            (user as any).imageUrl ||
            (user as any).image ||
            undefined;

          const resultId = await upsertUser({ clerkId, email, name, imageUrl });
          console.log("upsertUser called", { clerkId, email, name, imageUrl, resultId });

          router.push("/dashboard");
        } catch (error) {
          // Log more context for debugging
          console.error("Error upserting user. Clerk user object:", user);
          console.error("Error upserting user:", error);
          router.push("/dashboard");
        }
      } else if (isLoaded && !user) {
        // Not authenticated, redirect to home
        router.push("/");
      }
    };

    handleAuth();
  }, [isLoaded, user, upsertUser, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Setting up your account...
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You'll be redirected shortly
        </p>
      </div>
    </div>
  );
}
