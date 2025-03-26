import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      username: 'nigus123',
      email: 'nigus@example.com',
    },
  });

  console.log('Created user:', user);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
