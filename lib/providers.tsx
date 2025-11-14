"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect } from "react";
import { registerServiceWorker } from "./pwa";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function PWARegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
          footerActionLink: "text-indigo-600 hover:text-indigo-700",
        },
      }}
    >
      <ConvexProvider client={convex}>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <PWARegister />
          {children}
        </NextThemesProvider>
      </ConvexProvider>
    </ClerkProvider>
  );
}
