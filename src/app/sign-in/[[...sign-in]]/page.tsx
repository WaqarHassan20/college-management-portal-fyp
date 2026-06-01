"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white dark:bg-[#0e0c18] transition-colors duration-300">
      
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-brand-light via-brand-light/70 to-slate-100 dark:from-[#131022] dark:via-[#131022]/95 dark:to-[#090710] border-r border-zinc-200/50 dark:border-white/5 overflow-hidden transition-colors duration-300">
        
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-primary/10 dark:bg-brand-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-secondary/15 dark:bg-brand-secondary/10 blur-[120px] pointer-events-none" />
        
        {/* Dot Grid Background */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-brand-primary) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top Branding Section */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 rounded-2xl bg-brand-primary/20 blur-md transition-all group-hover:bg-brand-primary/30" />
            <Image
              src="/logo.svg"
              alt="Govt. Graduate College logo"
              width={56}
              height={56}
              className="relative z-10 drop-shadow-[0_0_15px_rgba(61,94,225,0.3)] transition-transform duration-500 group-hover:rotate-6"
              priority
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-primary dark:text-brand-secondary">
              Govt. Graduate College
            </p>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Hafizabad, Pakistan
            </p>
          </div>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 max-w-lg my-auto space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 dark:border-brand-primary/30 bg-white/80 dark:bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-primary dark:text-brand-secondary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            BSCS FYP Project 2022-2026
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-brand-dark dark:text-white">
            Not another template dashboard.
            <span className="block text-brand-primary mt-2">A daily operating system for your campus.</span>
          </h1>
          
          <p className="text-base xl:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            Streamlining academic excellence through unified digital management. Access your courses, grades, attendance, and more — all in one place.
          </p>

          {/* Feature list */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              "Student Records",
              "Attendance",
              "Quiz System",
              "Analytics Hub",
            ].map((feature, idx) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 shadow-xs hover:scale-102 transition-transform duration-200"
              >
                <CheckCircle2 className="h-4 w-4 text-brand-primary dark:text-brand-secondary shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 text-xs text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} Dept of Computer Science. Govt. Graduate College, Hafizabad.
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="relative flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 md:px-12">
        
        {/* Navigation & Theme Actions */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white flex items-center gap-2 text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Home
          </Link>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Mobile Branding Header */}
          <div className="flex flex-col items-center text-center lg:hidden">
            <Image
              src="/logo.svg"
              alt="Govt. Graduate College logo"
              width={64}
              height={64}
              className="mb-3 drop-shadow-[0_0_15px_rgba(61,94,225,0.2)]"
              priority
            />
            <h1 className="text-2xl font-black text-brand-dark dark:text-white">
              College Management Portal
            </h1>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
              Govt. Graduate College, Hafizabad
            </p>
          </div>

          <div className="flex justify-center w-full">
            <SignIn
              appearance={{
                baseTheme: isDark ? dark : undefined,
                elements: {
                  rootBox: "w-full",
                  cardBox: "shadow-none border-0 w-full",
                  card: "bg-transparent shadow-none p-0 border-0 w-full",
                  headerTitle: "text-2xl font-black tracking-tight text-brand-dark dark:text-white",
                  headerSubtitle: "text-zinc-500 dark:text-zinc-400 text-sm mt-1",
                  socialButtonsBlockButton: "border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 transition-all rounded-lg h-10 flex justify-center items-center w-full shadow-xs",
                  socialButtonsBlockButtonText: "font-semibold text-sm text-zinc-700 dark:text-zinc-200",
                  formButtonPrimary: "bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(61,94,225,0.15)] hover:shadow-[0_0_25px_rgba(61,94,225,0.3)] h-10 rounded-lg w-full",
                  formFieldLabel: "text-zinc-700 dark:text-zinc-300 font-semibold text-xs",
                  formFieldInput: "bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-brand-primary/20 transition-all h-10 rounded-lg px-3 w-full",
                  footerActionText: "text-zinc-500 dark:text-zinc-400 text-sm",
                  footerActionLink: "text-brand-primary hover:text-brand-primary/80 hover:underline font-semibold transition-all",
                  dividerLine: "bg-zinc-200 dark:bg-white/10",
                  dividerText: "text-zinc-400 dark:text-zinc-500 text-xs uppercase font-medium",
                  identityPreviewText: "text-zinc-700 dark:text-zinc-300",
                  identityPreviewEditButtonIcon: "text-brand-primary hover:text-brand-primary/90",
                  formFieldSuccessText: "text-emerald-600 dark:text-emerald-400 text-xs",
                  formFieldErrorText: "text-red-600 dark:text-red-400 text-xs",
                },
                variables: {
                  colorBackground: "transparent",
                  colorInputBackground: "transparent",
                  colorText: "currentColor",
                }
              }}
              forceRedirectUrl="/dashboard"
            />
          </div>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-brand-primary dark:text-brand-secondary hover:underline transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
