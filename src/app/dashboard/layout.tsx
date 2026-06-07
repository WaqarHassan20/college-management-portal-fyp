import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getRoleLabel } from "@/lib/sidebar-config";
import type { UserRole } from "@/types";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (error) {
    console.error("Clerk auth() error:", error);
  }

  let role: UserRole = "student";

  let shouldRedirectToSetup = false;
  if (userId) {
    try {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress;

      let dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { student: true },
      });

      // Fallback: look up by email if no record found by clerkId
      // (handles the case where the student record was created on approval before clerkId was linked)
      if (!dbUser && email) {
        const dbUserByEmail = await prisma.user.findUnique({
          where: { email },
          include: { student: true },
        });
        if (dbUserByEmail) {
          if (!dbUserByEmail.clerkId) {
            // First-time sign up after admin approval
            dbUser = await prisma.user.update({
              where: { id: dbUserByEmail.id },
              data: { clerkId: userId },
              include: { student: true },
            });
          } else if (dbUserByEmail.clerkId !== userId) {
            // Clerk user was deleted and recreated. Clear stale student profile & link new ID.
            if (dbUserByEmail.student) {
              await prisma.student.delete({
                where: { id: dbUserByEmail.student.id },
              });
            }
            // Delete admission records for the user's email to reset their onboarding form status
            await prisma.admission.deleteMany({
              where: { email },
            });
            dbUser = await prisma.user.update({
              where: { id: dbUserByEmail.id },
              data: { clerkId: userId },
              include: { student: true },
            });
          } else {
            dbUser = dbUserByEmail;
          }
        }
      }

      let userRole = "STUDENT";
      let hasStudentProfile = false;

      if (dbUser) {
        userRole = dbUser.role;
        hasStudentProfile = !!dbUser.student;
        role = dbUser.role.toLowerCase() as UserRole;
      } else {
        // Fallback to Clerk session claims if database sync is pending
        const authResult = await auth();
        const metadata = authResult.sessionClaims?.metadata as Record<string, unknown> | undefined;
        const claimsRole = typeof metadata?.role === "string" ? metadata.role : undefined;
        if (claimsRole && ["ADMIN", "FACULTY", "STUDENT"].includes(claimsRole.toUpperCase())) {
          userRole = claimsRole.toUpperCase();
        }
        role = userRole.toLowerCase() as UserRole;
      }

      if (userRole === "STUDENT" && !hasStudentProfile) {
        shouldRedirectToSetup = true;
      }

      // Provision a brand-new user record if still no record exists
      if (!dbUser) {
        const name = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
        if (email) {
          await prisma.user.create({
            data: {
              clerkId: userId,
              email,
              name: name || "New User",
              role: userRole as Role,
            },
          });
        } else {
          await prisma.user.upsert({
            where: { clerkId: userId },
            create: {
              clerkId: userId,
              email: `user_${userId}@placeholder.com`,
              name: name || "New User",
              role: userRole as Role,
            },
            update: {},
          });
        }
      }
    } catch (dbError) {
      console.error("Database error fetching user role:", dbError);
    }
  }

  if (shouldRedirectToSetup) {
    redirect("/student-setup");
  }

  // Fallback for development/screenshot mode when Clerk is unlinked or unreachable
  if (!userId) {
    if (process.env.NODE_ENV === "production") {
      redirect("/sign-in");
    } else {
      const headersList = await headers();
      const url = headersList.get("referer") || headersList.get("x-url") || "";
      if (url.includes("/dashboard/admin")) role = "admin";
      else if (url.includes("/dashboard/faculty")) role = "faculty";
    }
  }

  const roleLabel = getRoleLabel(role);

  return (
    <DashboardShell role={role} roleLabel={roleLabel}>
      {children}
    </DashboardShell>
  );
}
