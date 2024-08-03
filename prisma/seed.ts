import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt"

const prisma = new PrismaClient();

async function main() {
  const hashedPassword1 = await bcrypt.hash("fan123", 10); // Hash password 'fan123'
  const hashedPassword2 = await bcrypt.hash("admin123", 10); // Hash password 'admin123'
  await prisma.user.createMany({
    data: [
      {
        name: "fan",
        no_telp: "081234567890",
        email: "fan@gmail.com",
        password: hashedPassword1,
        role: Role.CUSTOMER,
      },
      {
        name: "admin",
        no_telp: "085333264004",
        email: "admin@gmail.com",
        password: hashedPassword2,
        role: Role.ADMIN,
      },
    ],
  });

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
