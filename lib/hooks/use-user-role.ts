"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useUserRole() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const isAdminQuery = useQuery(api.users.isAdmin);

  return {
    user: currentUser,
    isAdmin: isAdminQuery || false,
    isUser: currentUser?.role === "user",
    role: currentUser?.role,
    isLoading: currentUser === undefined,
  };
}
