import prisma from "../src/lib/prisma";

async function main() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { date: "desc" }
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  console.log("=== ANNOUNCEMENTS ===");
  console.log(JSON.stringify(announcements, null, 2));

  console.log("\n=== AUDIT LOGS ===");
  console.log(JSON.stringify(auditLogs, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
