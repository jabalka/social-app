import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { id: "infrastructure", name: "Infrastructure", icon: "building" },
      { id: "environmental", name: "Environmental", icon: "leaf" },
      { id: "education", name: "Education", icon: "graduation-cap" },
      { id: "public-safety", name: "Public Safety", icon: "shield-check" },
      { id: "transport", name: "Transport", icon: "bus" },
    ],
    skipDuplicates: true,
  });

  await prisma.role.createMany({
    data: [
      { id: "citizen", name: "Citizen", icon: "user" },
      { id: "admin", name: "Admin", icon: "user-cog" },
      { id: "mayor", name: "Mayor", icon: "gavel" },
      { id: "council", name: "Council", icon: "users" },
      { id: "planner", name: "Planner", icon: "compass" },
      { id: "inspector", name: "Inspector", icon: "check-circle-2" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log("✅ Seed complete");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("❌ Seed failed", e);
    return prisma.$disconnect();
  });
