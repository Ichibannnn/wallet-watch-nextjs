import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { MODULES, type ModuleKey } from "../src/lib/rbac/modules";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Crud = { canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean };

const FULL: Crud = { canCreate: true, canRead: true, canUpdate: true, canDelete: true };
const READ_ONLY: Crud = { canCreate: false, canRead: true, canUpdate: false, canDelete: false };
const NONE: Crud = { canCreate: false, canRead: false, canUpdate: false, canDelete: false };

/** Admin: full CRUD on every module. User: read on everything except user-management. */
function permissionsFor(role: "Admin" | "User"): Array<{ module: ModuleKey } & Crud> {
  return MODULES.map(({ key }) => {
    if (role === "Admin") return { module: key, ...FULL };
    return { module: key, ...(key === "user-management" ? NONE : READ_ONLY) };
  });
}

/** Create a system role and (re)sync its permission matrix. */
async function upsertSystemRole(name: "Admin" | "User", description: string) {
  const role = await prisma.role.upsert({
    where: { name },
    update: { description, isSystem: true },
    create: { name, description, isSystem: true },
  });

  for (const perm of permissionsFor(name)) {
    await prisma.permission.upsert({
      where: { roleId_module: { roleId: role.id, module: perm.module } },
      update: perm,
      create: { roleId: role.id, ...perm },
    });
  }

  return role;
}

async function main() {
  const admin = await upsertSystemRole("Admin", "Full access to every module.");
  await upsertSystemRole("User", "Read-only access to finance modules; no user management.");

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
