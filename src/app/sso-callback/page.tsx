"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-white dark:bg-[#0e0c18] transition-colors duration-300">
      <div className="flex flex-col items-center gap-4 z-10">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse">
          Securely connecting to portal...
        </p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
