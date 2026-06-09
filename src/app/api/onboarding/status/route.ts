import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, handleApiError } from "@/lib/api-errors";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    // 1. Fetch user from DB
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { student: true, faculty: true, admin: true },
    });

    if (dbUser) {
      const isComplete =
        (dbUser.role === "STUDENT" && !!dbUser.student) ||
        (dbUser.role === "FACULTY" && !!dbUser.faculty) ||
        (dbUser.role === "ADMIN" && !!dbUser.admin);

      if (isComplete) {
        return NextResponse.json({ hasProfile: true, role: dbUser.role });
      }
    }

    // 2. Fetch email from Clerk to check pending requests
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    const checkEmail = email || dbUser?.email;

    if (!checkEmail) {
      return NextResponse.json({ hasProfile: false, role: dbUser?.role || "STUDENT" });
    }

    // 3. Look up pending/rejected onboarding requests
    const [request, admission] = await Promise.all([
      prisma.onboardingRequest.findFirst({
        where: { email: checkEmail },
        orderBy: { createdAt: "desc" },
      }),
      prisma.admission.findFirst({
        where: { email: checkEmail },
        orderBy: { applicationDate: "desc" },
      }),
    ]);

    return NextResponse.json({
      hasProfile: false,
      role: dbUser?.role || "STUDENT",
      request,
      admission,
    });
  } catch (error) {
    return handleApiError("GET /api/onboarding/status", error);
  }
}
