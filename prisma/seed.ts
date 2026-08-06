import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { ALL_MODULE_KEYS } from "../src/lib/rbac/modules";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Admin: every module + sub-module. User: finance modules only, no user management. */
function modulesFor(role: "Admin" | "User"): string[] {
  if (role === "Admin") return [...ALL_MODULE_KEYS];
  return ["transactions", "statistics", "accounts", "categories"];
}

/** Create a system role and (re)sync its tagged modules. */
async function upsertSystemRole(name: "Admin" | "User", description: string) {
  const role = await prisma.role.upsert({
    where: { name },
    update: { description, isSystem: true },
    create: { name, description, isSystem: true },
  });

  // Replace the whole tag set so re-seeding stays idempotent.
  await prisma.roleModule.deleteMany({ where: { roleId: role.id } });
  await prisma.roleModule.createMany({
    data: modulesFor(name).map((module) => ({ roleId: role.id, module })),
  });

  return role;
}

async function main() {
  const admin = await upsertSystemRole("Admin", "Access to every module.");
  await upsertSystemRole("User", "Access to finance modules; no user management.");

  // Backfill: any existing user without a role becomes Admin so nobody is locked
  // out of the app the moment RBAC turns on. New self-signups get the User role.
  const backfilled = await prisma.user.updateMany({
    where: { roleId: null },
    data: { roleId: admin.id },
  });

  console.log(`Seeded roles. Backfilled ${backfilled.count} existing user(s) to Admin.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
