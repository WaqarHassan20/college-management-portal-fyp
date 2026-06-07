import prisma from "../src/lib/prisma";

async function main() {
  const admissions = await prisma.admission.findMany({
    orderBy: { applicationDate: "desc" },
    take: 5
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { student: true }
  });

  console.log("=== RECENT ADMISSIONS ===");
  console.log(JSON.stringify(admissions, null, 2));

  console.log("\n=== RECENT USERS ===");
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
