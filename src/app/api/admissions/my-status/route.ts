import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, handleApiError } from "@/lib/api-errors";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const clerkUser = await currentUser();
    const email =
      clerkUser?.emailAddresses.find(
        (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;

    if (!email) {
      return errorResponse("BAD_REQUEST", "User email not found in Clerk", 400);
    }

    // 1. Check if user exists in database and has a student profile (by clerkId first)
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { student: true },
    });

    if (dbUser?.student) {
      return NextResponse.json({ hasProfile: true, role: dbUser.role });
    }

    // 1b. Fallback: check by email in case the profile was created before clerkId was linked
    if (!dbUser) {
      const dbUserByEmail = await prisma.user.findUnique({
        where: { email },
        include: { student: true },
      });

      if (dbUserByEmail?.student) {
        // Link the clerkId now so future lookups are fast
        await prisma.user.update({
          where: { id: dbUserByEmail.id },
          data: { clerkId: userId },
        });
        return NextResponse.json({ hasProfile: true, role: dbUserByEmail.role });
      }
    }

    // 2. Search if there is an admission for this email
    const admission = await prisma.admission.findFirst({
      where: { email },
      orderBy: { applicationDate: "desc" },
    });

    // 3. Count total rejections and check block status for attempt limiting
    const rejectedCount = await prisma.admission.count({
      where: { email, status: "Rejected" },
    });
    const isBlocked = !!(await prisma.admission.findFirst({
      where: { email, blocked: true },
      select: { id: true },
    }));

    return NextResponse.json({
      hasProfile: false,
      role: dbUser?.role || "STUDENT",
      admission,
      rejectedCount,
      blocked: isBlocked,
    });
  } catch (error) {
    return handleApiError("GET /api/admissions/my-status", error);
  }
}
