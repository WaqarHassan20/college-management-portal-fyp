import prisma from "../src/lib/prisma";

async function main() {
  const students = await prisma.student.findMany({
    include: {
      user: { select: { email: true, name: true } },
      fees: true,
    },
  });

  console.log("=== Database Students & Fees ===");
  for (const s of students) {
    const pendingDues = s.fees
      .filter((f) => f.status !== "Paid")
      .reduce((sum, f) => sum + f.amount, 0);
    console.log(`Student Roll: ${s.rollNo}, Email: ${s.user.email}, Name: ${s.user.name}`);
    console.log(`- Pending Dues: PKR ${pendingDues}`);
    console.log(`- Fees:`, s.fees.map(f => `${f.type}: ${f.amount} (${f.status})`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
